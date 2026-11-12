import { z } from "zod";
export const progressSchema = z.object({
  version: z.literal(1),
  completed: z.array(z.string()),
  lastLesson: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Progress = z.infer<typeof progressSchema>;
export function parseProgress(value: unknown): Progress {
  return progressSchema.safeParse(value).success
    ? progressSchema.parse(value)
    : { version: 1, completed: [] };
}
export function complete(
  progress: Progress,
  id: string,
  validIds: string[],
): Progress {
  if (!validIds.includes(id)) throw Error("Unknown lesson");
  return {
    ...progress,
    completed: [
      ...new Set([
        ...progress.completed.filter((x) => validIds.includes(x)),
        id,
      ]),
    ],
    lastLesson: id,
    updatedAt: new Date().toISOString(),
  };
}
export function grade(answers: number[], correct: number[]) {
  return (
    answers.length === correct.length &&
    answers.every((answer, i) => answer === correct[i])
  );
}
