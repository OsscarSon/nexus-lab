import { z } from "zod";
export const mentorRequestSchema = z
  .object({
    mode: z.enum(["explain", "hint", "debug", "build"]),
    lessonId: z.string().max(80).optional(),
    userMessage: z.string().trim().min(1).max(2000),
    selectedCode: z.string().max(2000).optional(),
  })
  .strict();
export type MentorRequest = z.infer<typeof mentorRequestSchema>;
export type MentorResponse = {
  answer: string;
  providerKind: "platform" | "fallback";
  isSimulation: false;
  reason?: string;
  references: { title: string; url: string }[];
  quotaRemaining?: number;
};
export interface Provider {
  chat: (request: {
    system: string;
    user: string;
    maxTokens: number;
    signal: AbortSignal;
  }) => Promise<{
    answer: string;
    inputTokens?: number;
    outputTokens?: number;
  }>;
}
export function redact(text: string): string {
  return text
    .replace(/\b(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{8,}/g, "[REDACTED]")
    .replace(
      /((?:api[_-]?key|password|secret|token)\s*[:=]\s*)["']?[^\s"']+/gi,
      "$1[REDACTED]",
    );
}
