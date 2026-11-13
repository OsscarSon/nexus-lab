import { z } from "zod";
export const qualitySchema = z.object({
  state: z.enum(["draft", "in-development", "published"]),
  scores: z.array(z.number().int().min(0).max(5)).length(6),
  reviewedAt: z.string(),
  scope: z.string(),
});
export function passesQuality(scores: number[]) {
  return (
    scores.length === 6 &&
    scores.every((n) => Number.isInteger(n) && n >= 4 && n <= 5) &&
    scores.reduce((a, b) => a + b, 0) >= 25
  );
}
export function qualityLabel(review?: z.infer<typeof qualitySchema>) {
  return review?.state === "published"
    ? "入门单元已通过质量门槛"
    : "In Development · 可试学，尚未正式发布";
}
