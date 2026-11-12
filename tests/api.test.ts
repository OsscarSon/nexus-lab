import { afterEach, describe, it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store, defaultLimits } from "../apps/api/store";
import { createApp } from "../apps/api/server";
import { mentor, type GatewayConfig } from "../apps/api/gateway";
import { redact, type Provider } from "../packages/ai-gateway/contracts";
const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const fn of cleanup.splice(0).reverse()) await fn();
});
function store() {
  const s = new Store(":memory:");
  cleanup.push(() => s.close());
  return s;
}
function user(s: Store, id = "learner") {
  s.db
    .prepare("INSERT INTO users VALUES(?,?,?,?)")
    .run(id, id, "test-salt", "test-hash");
  return id;
}
function config(provider?: Provider): GatewayConfig {
  return {
    enabled: Boolean(provider),
    provider,
    inputPricePerMillion: 1000000,
    outputPricePerMillion: 2000000,
    limits: { ...defaultLimits },
  };
}
const request = {
  mode: "hint" as const,
  lessonId: "os-source",
  userMessage: "给我一个提示",
};
async function listen(s: Store, c = config()) {
  const app = createApp(s, c, { origin: "http://test.local" });
  await new Promise<void>((resolve) => app.listen(0, "127.0.0.1", resolve));
  cleanup.push(
    () =>
      new Promise<void>((resolve, reject) =>
        app.close((e) => (e ? reject(e) : resolve())),
      ),
  );
  const base = `http://127.0.0.1:${(app.address() as { port: number }).port}`;
  return {
    app,
    call: async (
      path: string,
      method = "GET",
      body?: unknown,
      cookie?: string,
      origin = "http://test.local",
    ) =>
      fetch(base + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Nexus-Client": "web",
          Origin: origin,
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}
async function register(
  call: Awaited<ReturnType<typeof listen>>["call"],
  username = "learner",
) {
  const response = await call("/api/auth/register", "POST", {
    username,
    password: "test-password-123",
  });
  expect(response.status).toBe(201);
  return response.headers.get("set-cookie")!.split(";")[0];
}
describe("account API boundaries", () => {
  it("stores hashed passwords, enforces sessions and CSRF, isolates user progress and revokes logout", async () => {
    const s = store();
    const { call } = await listen(s);
    expect((await call("/api/progress")).status).toBe(401);
    expect(
      (
        await call(
          "/api/auth/register",
          "POST",
          { username: "bad", password: "test-password-123" },
          undefined,
          "https://evil.example",
        )
      ).status,
    ).toBe(403);
    const alice = await register(call, "alice");
    const stored = s.db
      .prepare("SELECT password_hash FROM users WHERE username=?")
      .get("alice") as { password_hash: string };
    expect(stored.password_hash).not.toContain("test-password");
    expect(
      (
        await call(
          "/api/progress",
          "POST",
          { version: 1, completed: ["os-source"] },
          alice,
        )
      ).status,
    ).toBe(200);
    const bob = await register(call, "bobby");
    expect(
      (await (await call("/api/progress", "GET", undefined, bob)).json())
        .progress.completed,
    ).toEqual([]);
    expect(
      (
        await call(
          "/api/progress",
          "POST",
          { version: 1, completed: ["fake"] },
          bob,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await call(
          "/api/mentor/chat",
          "POST",
          { ...request, apiKey: "do-not-accept" },
          bob,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await call(
          "/api/mentor/chat",
          "POST",
          { ...request, lessonId: "private" },
          bob,
        )
      ).status,
    ).toBe(400);
    await call("/api/auth/logout", "POST", {}, alice);
    expect((await call("/api/progress", "GET", undefined, alice)).status).toBe(
      401,
    );
  });
  it("deleting an account revokes access while preserving global cost accounting", async () => {
    const s = store();
    const { call } = await listen(s);
    const cookie = await register(call);
    const id = (
      s.db.prepare("SELECT id FROM users WHERE username=?").get("learner") as {
        id: string;
      }
    ).id;
    const reservation = s.reserve(id, 100, 10, defaultLimits);
    s.reconcile(reservation.id!, 100, 10);
    expect((await call("/api/account", "DELETE", {}, cookie)).status).toBe(200);
    expect((await call("/api/progress", "GET", undefined, cookie)).status).toBe(
      401,
    );
    expect(s.usage("unused").globalMonthlyMicroUsd).toBe(10);
    expect(
      s.db.prepare("SELECT id FROM users WHERE username=?").get("learner"),
    ).toBeUndefined();
  });
  it("returns labeled fallback without credentials and enforces request size", async () => {
    const { call } = await listen(store());
    const response = await (
      await call("/api/mentor/chat", "POST", request)
    ).json();
    expect(response.providerKind).toBe("fallback");
    expect(response.reason).toBe("ai-disabled");
    expect(
      (
        await call("/api/mentor/chat", "POST", {
          ...request,
          userMessage: "x".repeat(15000),
        })
      ).status,
    ).toBe(413);
  });
});
describe("gateway with automated-test-only providers", () => {
  it("never invokes provider for anonymous users; redacts credentials and applies modes", async () => {
    const s = store();
    const id = user(s);
    let calls = 0;
    const provider: Provider = {
      chat: async (r) => {
        calls++;
        expect(r.system).toContain("一次只给一个提示");
        expect(r.user).not.toContain("sk-abcdefgh12345678");
        return { answer: "先识别源代码。", inputTokens: 100, outputTokens: 20 };
      },
    };
    expect((await mentor(request, undefined, s, config(provider))).reason).toBe(
      "sign-in-required",
    );
    expect(calls).toBe(0);
    const result = await mentor(
      { ...request, userMessage: "key sk-abcdefgh12345678" },
      id,
      s,
      config(provider),
    );
    expect(result.providerKind).toBe("platform");
    expect(s.usage(id).dailyTokens).toBe(120);
    expect(s.usage(id).userMonthlyMicroUsd).toBe(140);
    expect(calls).toBe(1);
  });
  it.each(["daily", "account", "global", "rate"] as const)(
    "stops %s quota before an external call",
    async (kind) => {
      const s = store(),
        id = user(s);
      let calls = 0;
      const c = config({
        chat: async () => {
          calls++;
          return { answer: "test", inputTokens: 1, outputTokens: 1 };
        },
      });
      if (kind === "daily") c.limits.dailyTokens = 1;
      if (kind === "account") c.limits.userMonthlyMicroUsd = 1;
      if (kind === "global") c.limits.globalMonthlyMicroUsd = 1;
      if (kind === "rate") c.limits.requestsPerMinute = 0;
      const result = await mentor(request, id, s, c);
      expect(result.providerKind).toBe("fallback");
      expect(calls).toBe(0);
    },
  );
  it("reserves concurrency atomically and disables on missing provider metering", async () => {
    const s = store(),
      id = user(s);
    let release!: (value: { answer: string }) => void;
    const c = config({
      chat: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    });
    c.limits.concurrency = 1;
    const pending = mentor(request, id, s, c);
    expect((await mentor(request, id, s, c)).reason).toBe("concurrency-limit");
    release({ answer: "unmetered" });
    expect((await pending).reason).toBe("provider-metering-unavailable");
    expect((await mentor(request, id, s, c)).reason).toBe(
      "provider-metering-unavailable",
    );
    expect(s.usage(id).dailyTokens).toBeGreaterThan(0);
  });
  it("provider failures preserve conservative reservations and use honest fallback", async () => {
    const s = store(),
      id = user(s);
    const result = await mentor(
      request,
      id,
      s,
      config({
        chat: async () => {
          throw Error("sensitive provider details");
        },
      }),
    );
    expect(result.reason).toBe("provider-unavailable");
    expect(result.answer).not.toContain("sensitive");
    expect(s.usage(id).userMonthlyMicroUsd).toBeGreaterThan(0);
  });
  it("persists quota across database restarts", () => {
    const dir = mkdtempSync(join(tmpdir(), "nexus-test-"));
    cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    const dbPath = join(dir, "test.sqlite");
    let s = new Store(dbPath);
    user(s);
    s.reserve("learner", 100, 50, defaultLimits);
    s.close();
    s = new Store(dbPath);
    expect(s.usage("learner").dailyTokens).toBe(100);
    expect(s.usage("learner").globalMonthlyMicroUsd).toBe(50);
    s.close();
  });
  it("redacts obvious key and password forms", () =>
    expect(
      redact("api_key=abc123 password:example ghp_abcdefghijk"),
    ).not.toMatch(/abc123|example|ghp_/));
});
it("records over-budget provider metering and fails closed on subsequent calls", async () => {
  const s = store(),
    id = user(s);
  const c = config({
    chat: async () => ({
      answer: "overshot",
      inputTokens: 100000,
      outputTokens: 1000,
    }),
  });
  expect((await mentor(request, id, s, c)).reason).toBe(
    "provider-metering-unavailable",
  );
  expect(s.usage(id).dailyTokens).toBe(101000);
  expect((await mentor(request, id, s, c)).reason).toBe(
    "provider-metering-unavailable",
  );
});

it("safely upgrades legacy SQLite rows with a byte-preserving backup and supports both protocols", async () => {
  const s = store();
  const { call } = await listen(s);
  const cookie = await register(call);
  const id = (
    s.db.prepare("SELECT id FROM users WHERE username=?").get("learner") as {
      id: string;
    }
  ).id;
  const original = JSON.stringify({
    version: 1,
    completed: ["os-source", "unknown-historical-id"],
    custom: "retain this",
  });
  s.db.prepare("INSERT INTO progress VALUES(?,?)").run(id, original);
  const before = await (
    await call("/api/progress/v2", "GET", undefined, cookie)
  ).json();
  expect(
    before.progress.evidence.some((e: { id: string }) => e.id === "os-source"),
  ).toBe(true);
  expect(JSON.stringify(before.progress.unresolved)).toContain(
    "unknown-historical-id",
  );
  expect(
    (await call("/api/progress/v2", "POST", before.progress, cookie)).status,
  ).toBe(200);
  expect(
    (
      s.db
        .prepare("SELECT data FROM progress_backups WHERE user_id=?")
        .get(id) as { data: string }
    ).data,
  ).toBe(original);
  const legacy = await (
    await call("/api/progress", "GET", undefined, cookie)
  ).json();
  expect(legacy.progress.version).toBe(1);
  expect(legacy.progress.completed).toContain("os-source");
  const broken = {
    version: 2,
    evidence: [
      {
        kind: "lesson",
        id: "os-source",
        version: 99,
        completedAt: null,
        source: "assessment",
        proof: {},
      },
    ],
    unresolved: [],
  };
  expect((await call("/api/progress/v2", "POST", broken, cookie)).status).toBe(
    400,
  );
  await call("/api/account", "DELETE", {}, cookie);
  expect(
    s.db.prepare("SELECT data FROM progress_backups WHERE user_id=?").get(id),
  ).toBeUndefined();
});
