import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { lessons } from "../../content/opensource";
import { progressSchema } from "../../packages/lesson-engine";
import { mentorRequestSchema } from "../../packages/ai-gateway/contracts";
import { OpenAICompatibleProvider } from "../../packages/ai-gateway/provider";
import { mentor, type GatewayConfig } from "./gateway";
import { Store, defaultLimits } from "./store";
const credentials = z
  .object({
    username: z.string().regex(/^[a-zA-Z0-9_-]{3,32}$/),
    password: z.string().min(12).max(128),
  })
  .strict();
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
async function body(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 12000) throw new HttpError(413, "请求过大");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "无效 JSON");
  }
}
export function createApp(
  store: Store,
  config: GatewayConfig,
  options: { origin: string; production?: boolean; staticDir?: string },
) {
  const server = createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cache-Control", "no-store");
    const json = (status: number, data: unknown) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url || "/", "http://localhost");
      const path = url.pathname;
      const ip = hash(req.socket.remoteAddress || "unknown");
      if (!store.rate("http:" + ip, 120, 60000))
        throw new HttpError(429, "请求太频繁，请稍后再试");
      const cookie = req.headers.cookie
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("nexus_session="))
        ?.slice(14);
      const session =
        cookie && /^[a-f0-9]{64}$/.test(cookie)
          ? (store.db
              .prepare(
                "SELECT user_id FROM sessions WHERE token_hash=? AND expires>?",
              )
              .get(hash(cookie), Date.now()) as { user_id: string } | undefined)
          : undefined;
      const userId = session?.user_id;
      if (path.startsWith("/api/") && req.method !== "GET") {
        const origin = req.headers.origin;
        const ownOrigin =
          (options.production ? "https://" : "http://") + req.headers.host;
        const devOrigins = options.production
          ? []
          : ["http://localhost:5173", "http://127.0.0.1:5173"];
        if (
          req.headers["x-nexus-client"] !== "web" ||
          req.headers["sec-fetch-site"] === "cross-site" ||
          (origin &&
            origin !== options.origin &&
            origin !== ownOrigin &&
            !devOrigins.includes(origin))
        )
          throw new HttpError(403, "请求来源校验失败");
        if (!req.headers["content-type"]?.startsWith("application/json"))
          throw new HttpError(415, "需要 JSON 请求");
      }
      const requireUser = () => {
        if (!userId) throw new HttpError(401, "请先登录");
        return userId;
      };
      function setSession(id: string) {
        const token = randomBytes(32).toString("hex");
        store.db
          .prepare("DELETE FROM sessions WHERE expires<?")
          .run(Date.now());
        store.db
          .prepare("INSERT INTO sessions VALUES(?,?,?)")
          .run(hash(token), id, Date.now() + 7 * 86400000);
        res.setHeader(
          "Set-Cookie",
          `nexus_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${options.production ? "; Secure" : ""}`,
        );
      }
      if (path === "/api/auth/session" && req.method === "GET") {
        const user = userId
          ? store.db
              .prepare("SELECT id,username FROM users WHERE id=?")
              .get(userId)
          : null;
        json(200, { user });
        return;
      }
      if (
        (path === "/api/auth/register" || path === "/api/auth/login") &&
        req.method === "POST"
      ) {
        if (!store.rate("auth:" + ip, 10, 60000))
          throw new HttpError(429, "登录尝试过多，请稍后再试");
        const data = credentials.safeParse(await body(req));
        if (!data.success)
          throw new HttpError(
            400,
            "用户名需 3–32 个英文字母、数字、下划线或短横线；密码需 12–128 字符",
          );
        const username = data.data.username.toLowerCase();
        const existing = store.db
          .prepare("SELECT * FROM users WHERE username=?")
          .get(username) as
          | { id: string; salt: string; password_hash: string }
          | undefined;
        if (path.endsWith("register")) {
          if (existing) throw new HttpError(409, "用户名不可用");
          if (!store.rate("register:" + ip, 5, 3600000))
            throw new HttpError(429, "注册次数过多，请稍后再试");
          const id = randomUUID(),
            salt = randomBytes(16).toString("hex");
          store.db
            .prepare("INSERT INTO users VALUES(?,?,?,?)")
            .run(
              id,
              username,
              salt,
              scryptSync(data.data.password, salt, 64).toString("hex"),
            );
          setSession(id);
          json(201, { user: { id, username } });
          return;
        }
        const candidate = scryptSync(
          data.data.password,
          existing?.salt || "missing-user-salt",
          64,
        );
        if (
          !existing ||
          !timingSafeEqual(
            candidate,
            Buffer.from(existing.password_hash, "hex"),
          )
        )
          throw new HttpError(401, "用户名或密码错误");
        setSession(existing.id);
        json(200, { user: { id: existing.id, username } });
        return;
      }
      if (path === "/api/auth/logout" && req.method === "POST") {
        if (cookie)
          store.db
            .prepare("DELETE FROM sessions WHERE token_hash=?")
            .run(hash(cookie));
        res.setHeader(
          "Set-Cookie",
          `nexus_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${options.production ? "; Secure" : ""}`,
        );
        json(200, { ok: true });
        return;
      }
      if (path === "/api/account" && req.method === "DELETE") {
        const id = requireUser();
        store.db.exec("BEGIN IMMEDIATE");
        try {
          for (const table of ["sessions", "progress"])
            store.db.prepare(`DELETE FROM ${table} WHERE user_id=?`).run(id);
          store.db
            .prepare(
              "UPDATE users SET username=?,salt=?,password_hash=? WHERE id=?",
            )
            .run(
              "deleted-" + randomUUID(),
              randomBytes(16).toString("hex"),
              randomBytes(64).toString("hex"),
              id,
            );
          store.db.exec("COMMIT");
        } catch (e) {
          store.db.exec("ROLLBACK");
          throw e;
        }
        res.setHeader(
          "Set-Cookie",
          "nexus_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
        );
        json(200, { ok: true });
        return;
      }
      if (path === "/api/progress" && req.method === "GET") {
        const row = store.db
          .prepare("SELECT data FROM progress WHERE user_id=?")
          .get(requireUser()) as { data: string } | undefined;
        json(200, {
          progress: row ? JSON.parse(row.data) : { version: 1, completed: [] },
        });
        return;
      }
      if (path === "/api/progress" && req.method === "POST") {
        const id = requireUser();
        const parsed = progressSchema.strict().safeParse(await body(req));
        if (
          !parsed.success ||
          parsed.data.completed.some((x) => !lessons.some((l) => l.id === x)) ||
          parsed.data.completed.length > lessons.length
        )
          throw new HttpError(400, "无效课程进度");
        const current = store.db
          .prepare("SELECT data FROM progress WHERE user_id=?")
          .get(id) as { data: string } | undefined;
        const previous = current
          ? progressSchema.parse(JSON.parse(current.data))
          : { completed: [] };
        const data = {
          ...parsed.data,
          completed: [
            ...new Set([...previous.completed, ...parsed.data.completed]),
          ],
          updatedAt: new Date().toISOString(),
        };
        store.db
          .prepare("INSERT OR REPLACE INTO progress VALUES(?,?)")
          .run(id, JSON.stringify(data));
        json(200, { progress: data });
        return;
      }
      if (path === "/api/mentor/usage" && req.method === "GET") {
        const enabled = config.enabled && Boolean(config.provider);
        json(200, {
          enabled,
          signedIn: Boolean(userId),
          usage: userId ? store.usage(userId) : null,
          limits: config.limits,
          byokEnabled: false,
        });
        return;
      }
      if (path === "/api/mentor/chat" && req.method === "POST") {
        const parsed = mentorRequestSchema.safeParse(await body(req));
        if (!parsed.success) throw new HttpError(400, "请求格式或长度无效");
        if (
          parsed.data.lessonId &&
          !lessons.some((l) => l.id === parsed.data.lessonId)
        )
          throw new HttpError(400, "未知课程上下文");
        if (!store.rate("chat-ip:" + ip, 20, 60000))
          throw new HttpError(429, "请求太频繁，请稍后再试");
        json(200, await mentor(parsed.data, userId, store, config));
        return;
      }
      if (path === "/api/health" && req.method === "GET") {
        json(200, {
          ok: true,
          aiEnabled: config.enabled && Boolean(config.provider),
        });
        return;
      }
      if (path.startsWith("/api/")) throw new HttpError(404, "接口不存在");
      if (req.method !== "GET") throw new HttpError(405, "不支持的请求方式");
      await serveStatic(path, res, options.staticDir || resolve("dist"));
    } catch (error) {
      if (res.headersSent) {
        res.end();
        return;
      }
      json(error instanceof HttpError ? error.status : 500, {
        error: error instanceof HttpError ? error.message : "服务暂时不可用",
      });
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.keepAliveTimeout = 5000;
  server.maxConnections = 100;
  return server;
}
async function serveStatic(path: string, res: ServerResponse, root: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    throw new HttpError(400, "无效路径");
  }
  const file = resolve(root, "." + decoded);
  if (!file.startsWith(resolve(root) + "/") && file !== resolve(root))
    throw new HttpError(403, "无效路径");
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".wasm": "application/wasm",
    ".zip": "application/zip",
    ".json": "application/json",
  };
  let data: Buffer;
  let target = file;
  try {
    data = await readFile(file);
  } catch {
    if (extname(file)) throw new HttpError(404, "资源不存在");
    target = resolve(root, "index.html");
    try {
      data = await readFile(target);
    } catch {
      throw new HttpError(503, "请先执行 pnpm build");
    }
  }
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  res.writeHead(200, {
    "Content-Type": types[extname(target)] || "application/octet-stream",
  });
  res.end(data);
}
function configuredLimit(name: string, fallback: number) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0)
    throw Error(`Invalid nonnegative integer configuration: ${name}`);
  return parsed;
}
export function configFromEnv(): GatewayConfig {
  const rate = (key: string) => {
    const n = Number(process.env[key]);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const enabled = process.env.NEXUS_AI_ENABLED === "true";
  const input = rate("NEXUS_AI_INPUT_MICROUSD_PER_MILLION"),
    output = rate("NEXUS_AI_OUTPUT_MICROUSD_PER_MILLION");
  const key = process.env.NEXUS_AI_API_KEY;
  const model = process.env.NEXUS_AI_MODEL;
  const endpoint = process.env.NEXUS_AI_ENDPOINT;
  if (enabled && (!key || !model || !endpoint || !input || !output))
    throw Error(
      "AI enablement requires server key, model, HTTPS endpoint and explicit token prices",
    );
  return {
    enabled,
    provider: enabled
      ? new OpenAICompatibleProvider({
          key: key!,
          model: model!,
          endpoint: endpoint!,
        })
      : undefined,
    inputPricePerMillion: input,
    outputPricePerMillion: output,
    limits: {
      requestsPerMinute: configuredLimit(
        "NEXUS_AI_REQUESTS_PER_MINUTE",
        defaultLimits.requestsPerMinute,
      ),
      dailyTokens: configuredLimit(
        "NEXUS_AI_DAILY_TOKENS",
        defaultLimits.dailyTokens,
      ),
      userMonthlyMicroUsd: configuredLimit(
        "NEXUS_AI_USER_MONTHLY_MICROUSD",
        defaultLimits.userMonthlyMicroUsd,
      ),
      globalMonthlyMicroUsd: configuredLimit(
        "NEXUS_AI_GLOBAL_MONTHLY_MICROUSD",
        defaultLimits.globalMonthlyMicroUsd,
      ),
      concurrency: configuredLimit(
        "NEXUS_AI_CONCURRENCY",
        defaultLimits.concurrency,
      ),
    },
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.umask(0o077);
  const path = resolve(process.env.NEXUS_DB_PATH || ".cache/nexus.sqlite");
  await mkdir(dirname(path), { recursive: true });
  const store = new Store(path);
  const app = createApp(store, configFromEnv(), {
    origin: process.env.NEXUS_APP_ORIGIN || "http://127.0.0.1:5173",
    production: process.env.NODE_ENV === "production",
  });
  const port = Number(process.env.PORT || 3001);
  app.listen(port, process.env.NEXUS_BIND || "127.0.0.1", () =>
    console.log(
      `NEXUS API listening on port ${port}; AI ${process.env.NEXUS_AI_ENABLED === "true" ? "enabled" : "disabled"}`,
    ),
  );
  const stop = () =>
    app.close(() => {
      store.close();
      process.exit(0);
    });
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}
