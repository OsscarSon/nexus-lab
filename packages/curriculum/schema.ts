import { z } from "zod";
export const kinds = [
  "academy",
  "topic",
  "path",
  "course",
  "module",
  "lesson",
  "assessment",
  "project",
  "lab",
] as const;
export const publicationSchema = z.enum([
  "available",
  "in-development",
  "planned",
  "archived",
]);
const id = z
  .string()
  .regex(/^[a-z0-9][a-z0-9.-]*$/)
  .max(120);
export const refSchema = z
  .object({ kind: z.enum(kinds), id, version: z.number().int().positive() })
  .strict();
export type ContentRef = z.infer<typeof refSchema>;
export type Kind = ContentRef["kind"];
const refs = (kind: Kind) =>
  z.array(
    refSchema.refine((r) => r.kind === kind, `Expected ${kind} reference`),
  );
const base = {
  id,
  version: z.number().int().positive(),
  title: z.string().min(1),
  status: publicationSchema,
};
const objectives = z.array(z.string().min(1)).min(1);
export const interactionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("repository"), id }),
  z.object({
    kind: z.literal("numeric"),
    id,
    label: z.string(),
    left: z.number(),
    right: z.number(),
    operator: z.enum(["+", "*"]),
  }),
  z.object({
    kind: z.literal("prompt"),
    id,
    task: z.string().min(1),
    audience: z.string().min(1),
    constraint: z.string().min(1),
  }),
  z.object({
    kind: z.literal("game"),
    id,
    target: z.number().int().min(1).max(10),
  }),
  z.object({
    kind: z.literal("logic"),
    id,
    gate: z.enum(["AND", "OR", "XOR", "NOT"]),
  }),
  z.object({
    kind: z.literal("request"),
    id,
    method: z.enum(["GET", "POST"]),
    path: z.string().regex(/^\/[a-z/]+$/),
  }),
  z.object({
    kind: z.literal("permissions"),
    id,
    options: z.array(z.string().min(1)).min(2),
    expected: z.array(z.string()).min(1),
  }),
  z.object({
    kind: z.literal("sensor"),
    id,
    temperature: z.number(),
    threshold: z.number(),
  }),
  z.object({
    kind: z.literal("classification"),
    instructions: z.string().min(1),
    id,
    claims: z
      .array(z.object({ text: z.string(), category: z.string() }))
      .min(2),
    categories: z.array(z.string()).min(2),
  }),
  z.object({ kind: z.literal("formula"), id, description: z.string() }),
  z.object({
    kind: z.literal("lab-evidence"),
    id,
    labRef: refSchema.refine((r) => r.kind === "lab"),
  }),
]);
export type Interaction = z.infer<typeof interactionSchema>;
export const lessonSchema = z
  .object({
    ...base,
    kind: z.literal("lesson"),
    objectives,
    summary: z.string(),
    segments: z
      .array(z.object({ heading: z.string(), body: z.string().min(1) }))
      .min(1),
    example: z.string().min(1),
    estimatedMinutes: z.number().positive(),
    topicRefs: refs("topic"),
    assessmentRefs: refs("assessment"),
    blocks: z.array(interactionSchema),
    requiresExercise: z.boolean(),
    legacyCompatible: z.boolean().default(false),
    hints: z.array(z.string()).min(1),
    references: z.array(z.object({ title: z.string(), url: z.url() })),
    nextRefs: z.array(refSchema),
  })
  .strict();
export const assessmentSchema = z
  .object({
    ...base,
    kind: z.literal("assessment"),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    correct: z.number().int().nonnegative(),
    explanation: z.string().min(1),
  })
  .strict()
  .refine(
    (a) => a.correct < a.options.length,
    "Correct answer is outside options",
  );
export const entitySchema = z.discriminatedUnion("kind", [
  z.object({
    ...base,
    kind: z.literal("academy"),
    description: z.string(),
    pathRefs: refs("path"),
  }),
  z.object({
    ...base,
    kind: z.literal("topic"),
    outcomes: objectives,
    resourceRefs: z.array(refSchema),
  }),
  z.object({
    ...base,
    kind: z.literal("path"),
    academyRefs: refs("academy"),
    outcomes: objectives,
    courseRefs: refs("course"),
    projectRefs: refs("project"),
  }),
  z.object({
    ...base,
    kind: z.literal("course"),
    description: z.string(),
    outcomes: objectives,
    moduleRefs: refs("module"),
    assessmentRefs: refs("assessment"),
    projectRefs: refs("project"),
    completionRule: z.literal("all-required"),
  }),
  z.object({
    ...base,
    kind: z.literal("module"),
    outcomes: objectives,
    lessonRefs: refs("lesson"),
    assessmentRefs: refs("assessment"),
  }),
  lessonSchema,
  assessmentSchema,
  z.object({
    ...base,
    kind: z.literal("project"),
    description: z.string(),
    rubric: objectives,
    completionRefs: z.array(refSchema),
  }),
  z.object({
    ...base,
    kind: z.literal("lab"),
    labId: z.enum(["git", "logic", "python", "spreadsheet"]),
    sampleId: z.enum(["variables", "loops", "functions"]).optional(),
    expectedOutput: z.string().optional(),
    route: z.string().regex(/^\/lab\/(git|logic|python|spreadsheet)$/),
    runtime: z.enum(["simulation", "python", "formula"]),
  }),
]);
export const catalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    entities: z.array(entitySchema),
    dependencies: z.array(
      z.object({
        from: refSchema,
        to: refSchema,
        kind: z.enum(["required", "recommended", "related"]),
        rationale: z.string().min(1),
      }),
    ),
    aliases: z.array(
      z.object({ route: z.string().startsWith("/"), ref: refSchema }),
    ),
  })
  .strict();
export type Entity = z.infer<typeof entitySchema>;
export type Lesson = Extract<Entity, { kind: "lesson" }>;
export type Catalog = z.infer<typeof catalogSchema>;
export function ref(kind: Kind, id: string, version = 1): ContentRef {
  return { kind, id, version };
}
