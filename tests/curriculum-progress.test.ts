import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { curriculum, baseCatalog } from "../content/curriculum";
import { ref } from "../packages/curriculum/schema";
import { CurriculumRegistry, key } from "../packages/curriculum/registry";
import {
  normalizeLedger,
  courseProgress,
  emptyLedger,
  mergeLedgers,
  validateEvidence,
  type Evidence,
} from "../packages/curriculum/evidence";
import {
  readCurriculumProgress,
  migrateLearningData,
  saveEvidence,
  ledgerKey,
} from "../apps/web/src/curriculum-storage";
let memory: Map<string, string>;
beforeEach(() => {
  memory = new Map();
  vi.stubGlobal("localStorage", {
    get length() {
      return memory.size;
    },
    key: (i: number) => [...memory.keys()][i] || null,
    getItem: (key: string) => memory.get(key) || null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  });
});
afterEach(() => vi.unstubAllGlobals());
const answer = (id = "os-source"): Evidence => ({
  kind: "lesson",
  id,
  version: 1,
  source: "assessment",
  completedAt: "2026-11-13T00:00:00.000Z",
  proof: {
    exercise: {},
    answers: {
      ["assessment." + id]: curriculum.get("assessment", "assessment." + id)!
        .correct,
    },
  },
});
it("backs up original v1 bytes and imports canonical completion idempotently without changing old keys", () => {
  const original = JSON.stringify({
    version: 1,
    completed: ["os-source", "future-unknown"],
    custom: "retain",
  });
  memory.set("nexus-progress", original);
  expect(migrateLearningData()).toBe(true);
  const first = memory.get(ledgerKey);
  expect(migrateLearningData()).toBe(true);
  expect(JSON.parse(memory.get(ledgerKey)!)).toEqual(JSON.parse(first!));
  expect(memory.get("nexus-progress")).toBe(original);
  expect(
    JSON.parse(memory.get("nexus-curriculum-backup-v1")!).original[
      "nexus-progress"
    ],
  ).toBe(original);
  expect(readCurriculumProgress().unresolved).toContainEqual({
    source: "legacy-completion",
    id: "future-unknown",
  });
  expect(
    courseProgress(
      ref("course", "course.opensource-literacy"),
      readCurriculumProgress(),
      curriculum,
    ).completed,
  ).toBe(1);
});
it("never converts bad answers or an incompatible version into credit", () => {
  const valid = answer();
  expect(validateEvidence(valid, curriculum)).toBe(true);
  expect(validateEvidence({ ...valid, version: 2 }, curriculum)).toBe(false);
  expect(
    validateEvidence(
      { ...valid, proof: { answers: { "assessment.os-source": 0 } } },
      curriculum,
    ),
  ).toBe(false);
  expect(saveEvidence({ ...valid, version: 2 })).toBe(false);
  expect(memory.has(ledgerKey)).toBe(false);
});
it("preserves malformed raw values in backup and unresolved records", () => {
  memory.set("nexus-progress", "not-json");
  memory.set(ledgerKey, "bad-json-v2");
  expect(migrateLearningData()).toBe(true);
  expect(memory.get("nexus-progress")).toBe("not-json");
  expect(JSON.stringify(readCurriculumProgress().unresolved)).toContain(
    "bad-json-v2",
  );
  expect(memory.get("nexus-curriculum-backup-v1")).toContain("not-json");
});
it("fails safely when browser storage is unavailable", () => {
  memory.set("nexus-progress", "original");
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => memory.get(k) || null,
    setItem: () => {
      throw Error("quota exceeded");
    },
  });
  expect(saveEvidence(answer())).toBe(false);
  expect(memory.get("nexus-progress")).toBe("original");
  expect(memory.has(ledgerKey)).toBe(false);
});
it("deduplicates shared evidence and never downgrades verified proof to a legacy claim", () => {
  const a = { ...emptyLedger(), evidence: [answer()] };
  const b = {
    ...emptyLedger(),
    evidence: [
      {
        ...answer(),
        source: "legacy" as const,
        completedAt: "2099-01-01T00:00:00.000Z",
      },
    ],
  };
  const merged = mergeLedgers(a, b);
  expect(merged.evidence).toHaveLength(1);
  expect(merged.evidence[0].source).toBe("assessment");
  expect(
    courseProgress(
      ref("course", "course.opensource-literacy"),
      merged,
      curriculum,
    ).completed,
  ).toBe(1);
});
it("retains stale versions and unknown records as unresolved rather than deleting them", () => {
  const raw = {
    ...emptyLedger(),
    evidence: [
      { ...answer(), version: 9 },
      { ...answer(), id: "unknown" },
    ],
  };
  const result = normalizeLedger(raw, curriculum);
  expect(result.evidence).toHaveLength(0);
  expect(result.unresolved).toHaveLength(2);
});
it("does not award hard-prerequisite credit before evidence exists", () => {
  const c = baseCatalog();
  c.dependencies.push({
    from: ref("lesson", "os-permissions"),
    to: ref("lesson", "os-source"),
    kind: "required",
    rationale: "先认识源码",
  });
  const r = new CurriculumRegistry(c);
  const ledger = { ...emptyLedger(), evidence: [answer("os-permissions")] };
  expect(
    courseProgress(ref("course", "course.opensource-literacy"), ledger, r)
      .completed,
  ).toBe(0);
  ledger.evidence.push(answer());
  expect(
    courseProgress(ref("course", "course.opensource-literacy"), ledger, r)
      .completed,
  ).toBe(2);
  expect(
    r.prerequisites(
      ref("lesson", "os-permissions"),
      new Set([key(ref("lesson", "os-source"))]),
    )[0].satisfied,
  ).toBe(true);
});
it("requires actual exercise proof as well as quiz answers for a generic new lesson", () => {
  const c = baseCatalog();
  const source = c.entities.find(
    (e) => e.kind === "lesson" && e.id === "os-source",
  )!;
  if (source.kind !== "lesson") throw Error("fixture");
  c.entities.push({
    ...source,
    id: "generic-fixture",
    legacyCompatible: false,
    requiresExercise: true,
    blocks: [
      {
        kind: "numeric",
        id: "fixture.multiply",
        label: "计算 7×2",
        left: 7,
        right: 2,
        operator: "*",
      },
    ],
  });
  const registry = new CurriculumRegistry(c);
  const base = { ...answer(), id: "generic-fixture" };
  expect(validateEvidence(base, registry)).toBe(false);
  expect(validateEvidence({ ...base, source: "legacy" }, registry)).toBe(false);
  expect(
    validateEvidence(
      {
        ...base,
        proof: {
          exercise: { "fixture.multiply": 14 },
          answers: { "assessment.os-source": 1 },
        },
      },
      registry,
    ),
  ).toBe(true);
});

it("counts an explicit module assessment instead of silently ignoring it", () => {
  const c = baseCatalog();
  const module = c.entities.find(
    (e) => e.kind === "module" && e.id === "os-m01",
  )!;
  if (module.kind !== "module") throw Error("fixture");
  module.assessmentRefs = [ref("assessment", "assessment.os-source")];
  const registry = new CurriculumRegistry(c);
  const ledger = { ...emptyLedger(), evidence: [answer()] };
  expect(
    courseProgress(
      ref("course", "course.opensource-literacy"),
      ledger,
      registry,
    ),
  ).toMatchObject({ total: 7, completed: 1 });
  const checkpoint: Evidence = {
    kind: "assessment",
    id: "assessment.os-source",
    version: 1,
    source: "assessment",
    completedAt: null,
    proof: { answer: 1 },
  };
  expect(validateEvidence(checkpoint, registry)).toBe(true);
  ledger.evidence.push(checkpoint);
  expect(
    courseProgress(
      ref("course", "course.opensource-literacy"),
      ledger,
      registry,
    ).completed,
  ).toBe(2);
});
