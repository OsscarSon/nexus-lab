import { z } from "zod";
import type { Interaction, Lesson, ContentRef } from "./schema";
import { CurriculumRegistry, key } from "./registry";
import { gitLab, logicLab, gateOutput } from "../lab-contracts";
import { evaluateFormula } from "../formulas";
const object = (value: unknown) =>
  z.record(z.string(), z.unknown()).safeParse(value);
export function checkLab(
  registry: CurriculumRegistry,
  id: string,
  value: unknown,
): boolean {
  const lab = registry.get("lab", id);
  if (!lab) return false;
  try {
    switch (lab.labId) {
      case "git": {
        const p = z
          .object({
            state: z.object({
              branch: z.string(),
              working: z.string(),
              staged: z.string().nullable(),
              message: z.string(),
              commits: z
                .array(
                  z.object({
                    id: z.number(),
                    branch: z.string(),
                    message: z.string(),
                    content: z.string(),
                  }),
                )
                .max(100),
            }),
          })
          .safeParse(value);
        return p.success && gitLab.evaluate(p.data.state).passed;
      }
      case "logic": {
        const p = z
          .object({
            state: z.object({
              gate: z.enum(["AND", "OR", "XOR", "NOT"]),
              a: z.boolean(),
              b: z.boolean(),
              predictions: z.array(z.boolean().nullable()).length(4),
            }),
          })
          .safeParse(value);
        return p.success && logicLab.evaluate(p.data.state).passed;
      }
      case "python": {
        const p = z.object({ output: z.string() }).safeParse(value);
        return (
          p.success &&
          Boolean(lab.expectedOutput) &&
          p.data.output === lab.expectedOutput
        );
      }
      case "spreadsheet": {
        const p = z.object({ formula: z.string().max(300) }).safeParse(value);
        return p.success && checkFormula(p.data.formula);
      }
    }
  } catch {
    return false;
  }
}
export function checkFormula(formula: string) {
  try {
    return [
      { B2: "12", B3: "18" },
      { B2: "3", B3: "8" },
      { B2: "5", B3: "0" },
    ].every((f) => evaluateFormula(formula, f) === Number(f.B2) + Number(f.B3));
  } catch {
    return false;
  }
}
export function checkInteraction(
  block: Interaction,
  value: unknown,
  registry: CurriculumRegistry,
): { passed: boolean; feedback: string } {
  let passed = false;
  const parsed = object(value);
  const p = parsed.success ? parsed.data : {};
  switch (block.kind) {
    case "repository":
      passed = true;
      break;
    case "numeric":
      passed =
        typeof value === "number" &&
        value ===
          (block.operator === "+"
            ? block.left + block.right
            : block.left * block.right);
      break;
    case "prompt":
      passed =
        typeof p.goal === "string" &&
        p.goal.includes(block.task) &&
        typeof p.audience === "string" &&
        p.audience.includes(block.audience) &&
        typeof p.constraint === "string" &&
        p.constraint.includes(block.constraint);
      break;
    case "game": {
      const moves = z
        .array(z.enum(["collect", "reset"]))
        .max(32)
        .safeParse(value);
      passed =
        moves.success &&
        moves.data.reduce((score, m) => (m === "reset" ? 0 : score + 1), 0) >=
          block.target;
      break;
    }
    case "logic": {
      const values = z.array(z.boolean()).length(4).safeParse(value);
      passed =
        values.success &&
        values.data.every(
          (v, i) =>
            v === gateOutput(block.gate, Boolean(i & 2), Boolean(i & 1)),
        );
      break;
    }
    case "request":
      passed = p.method === block.method && p.path === block.path;
      break;
    case "permissions": {
      const values = z.array(z.string()).safeParse(value);
      passed =
        values.success &&
        new Set(values.data).size === block.expected.length &&
        block.expected.every((x) => values.data.includes(x));
      break;
    }
    case "sensor":
      passed =
        typeof value === "boolean" &&
        value === block.temperature >= block.threshold;
      break;
    case "classification": {
      const values = z.array(z.string()).safeParse(value);
      passed =
        values.success &&
        values.data.length === block.claims.length &&
        values.data.every((v, i) => v === block.claims[i].category);
      break;
    }
    case "formula":
      passed = typeof value === "string" && checkFormula(value);
      break;
    case "lab-evidence":
      passed = checkLab(registry, block.labRef.id, value);
      break;
  }
  return {
    passed,
    feedback: passed
      ? "练习检查通过：你的操作满足本课目标。"
      : "还需调整：请对照任务的输入、条件和结果再检查一次。",
  };
}
export const evidenceSchema = z
  .object({
    kind: z.enum(["lesson", "lab", "project", "assessment"]),
    id: z.string().max(120),
    version: z.number().int().positive(),
    completedAt: z.string().datetime().nullable(),
    source: z.enum(["legacy", "assessment", "lab-import"]),
    proof: z.unknown(),
  })
  .strict();
export type Evidence = z.infer<typeof evidenceSchema>;
export const ledgerSchema = z
  .object({
    version: z.literal(2),
    evidence: z.array(evidenceSchema).max(2000),
    unresolved: z.array(z.unknown()).max(2000),
    lastLesson: z.string().max(120).optional(),
    updatedAt: z.string().optional(),
  })
  .strict();
export type Ledger = z.infer<typeof ledgerSchema>;
export function emptyLedger(): Ledger {
  return { version: 2, evidence: [], unresolved: [] };
}
export function gradeLesson(
  lesson: Lesson,
  proof: unknown,
  registry: CurriculumRegistry,
) {
  const parsed = object(proof);
  if (!parsed.success) return false;
  const exercises = object(parsed.data.exercise),
    answers = object(parsed.data.answers);
  if (!answers.success) return false;
  if (
    lesson.requiresExercise &&
    (!exercises.success ||
      !lesson.blocks
        .filter((b) => b.kind !== "repository")
        .every(
          (b) => checkInteraction(b, exercises.data[b.id], registry).passed,
        ))
  )
    return false;
  return lesson.assessmentRefs.every((r) => {
    const a = registry.get("assessment", r.id);
    return a && a.version === r.version && answers.data[a.id] === a.correct;
  });
}
export function validateEvidence(e: Evidence, registry: CurriculumRegistry) {
  const target = registry.get(e.kind, e.id);
  if (!target || target.status !== "available" || target.version !== e.version)
    return false;
  if (e.kind === "lesson" && target.kind === "lesson") {
    if (e.source === "legacy") return target.legacyCompatible;
    return e.source === "assessment" && gradeLesson(target, e.proof, registry);
  }
  if (e.kind === "assessment" && target.kind === "assessment") {
    const p = object(e.proof);
    return (
      e.source === "assessment" && p.success && p.data.answer === target.correct
    );
  }
  if (e.kind === "lab")
    return e.source === "lab-import" && checkLab(registry, e.id, e.proof);
  if (e.kind === "project" && e.id === "project.legacy-worksheet") {
    const p = z
      .object({ answers: z.tuple([z.literal(0), z.literal(1), z.literal(2)]) })
      .safeParse(e.proof);
    return p.success;
  }
  return false;
}
const fingerprint = (e: Evidence) => e.kind + ":" + e.id + "@" + e.version;
export function mergeLedgers(a: Ledger, b: Ledger): Ledger {
  const index = new Map<string, Evidence>();
  for (const e of [...a.evidence, ...b.evidence]) {
    const previous = index.get(fingerprint(e));
    const rank = (item: Evidence) => (item.source === "legacy" ? 0 : 1);
    if (
      !previous ||
      rank(e) > rank(previous) ||
      (rank(e) === rank(previous) &&
        (e.completedAt || "") >= (previous.completedAt || ""))
    )
      index.set(fingerprint(e), e);
  }
  const unresolved = [
    ...new Map(
      [...a.unresolved, ...b.unresolved].map((v) => [JSON.stringify(v), v]),
    ).values(),
  ];
  return {
    version: 2,
    evidence: [...index.values()],
    unresolved,
    lastLesson: b.lastLesson || a.lastLesson,
    updatedAt: b.updatedAt || a.updatedAt,
  };
}
export function importLegacyProgress(
  raw: unknown,
  registry: CurriculumRegistry,
): Ledger {
  const result = emptyLedger();
  if (raw === null || raw === undefined) return result;
  const parsed = z
    .object({
      version: z.literal(1),
      completed: z.array(z.string()),
      lastLesson: z.string().optional(),
      updatedAt: z.string().optional(),
    })
    .safeParse(raw);
  if (!parsed.success) {
    result.unresolved.push({ source: "legacy-progress", data: raw });
    return result;
  }
  for (const id of new Set(parsed.data.completed)) {
    const lesson = registry.get("lesson", id);
    if (lesson?.legacyCompatible)
      result.evidence.push({
        kind: "lesson",
        id,
        version: lesson.version,
        source: "legacy",
        completedAt: null,
        proof: { origin: "v1-completion" },
      });
    else result.unresolved.push({ source: "legacy-completion", id });
  }
  result.lastLesson = parsed.data.lastLesson;
  result.updatedAt = parsed.data.updatedAt;
  return result;
}
export function normalizeLedger(
  raw: unknown,
  registry: CurriculumRegistry,
  legacy?: unknown,
): Ledger {
  let result = emptyLedger();
  if (raw !== null && raw !== undefined) {
    const parsed = ledgerSchema.safeParse(raw);
    if (parsed.success) {
      result = { ...parsed.data, evidence: [] };
      for (const e of parsed.data.evidence) {
        if (validateEvidence(e, registry)) result.evidence.push(e);
        else
          result.unresolved.push({ source: "unsupported-evidence", data: e });
      }
    } else result.unresolved.push({ source: "invalid-v2", data: raw });
  }
  return mergeLedgers(importLegacyProgress(legacy, registry), result);
}
export function completedKeys(ledger: Ledger, registry: CurriculumRegistry) {
  const result = new Set(
    ledger.evidence.filter((e) => validateEvidence(e, registry)).map(key),
  );
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of ledger.evidence) {
      if (!result.has(key(e))) continue;
      const required = registry.catalog.dependencies.filter(
        (d) => d.kind === "required" && key(d.from) === key(e),
      );
      if (
        required.some(
          (d) => !registry.requirements(d.to).every((r) => result.has(key(r))),
        )
      ) {
        result.delete(key(e));
        changed = true;
      }
    }
  }
  return result;
}
export function courseProgress(
  r: ContentRef,
  ledger: Ledger,
  registry: CurriculumRegistry,
) {
  const refs = registry.requirements(r);
  const completed = completedKeys(ledger, registry);
  const requirements = refs.filter(
    (item) =>
      item.kind === "lesson" ||
      item.kind === "lab" ||
      item.kind === "assessment",
  );
  const count = requirements.filter((item) => completed.has(key(item))).length;
  return {
    completed: count,
    total: requirements.length,
    passed: requirements.length > 0 && count === requirements.length,
  };
}
export function legacyProjection(ledger: Ledger, registry: CurriculumRegistry) {
  const completed = completedKeys(ledger, registry);
  return {
    version: 1 as const,
    completed: [
      ...new Set(
        ledger.evidence
          .filter((e) => e.kind === "lesson" && completed.has(key(e)))
          .map((e) => e.id),
      ),
    ],
    lastLesson: ledger.lastLesson,
    updatedAt: ledger.updatedAt,
  };
}
