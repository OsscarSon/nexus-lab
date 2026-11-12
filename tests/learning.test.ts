import { describe, it, expect } from "vitest";
import { lessons } from "../content/opensource";
import { complete, parseProgress, grade } from "../packages/lesson-engine";
describe("learning evidence", () => {
  it("validates all six curriculum topics and requires real quiz choices", () => {
    expect(lessons).toHaveLength(6);
    for (const l of lessons) {
      expect(l.options[l.correct]).toBeTruthy();
      expect(l.segments[0].body.length).toBeGreaterThan(50);
    }
    expect(grade([0, 1, 2], [0, 1, 2])).toBe(true);
    expect(grade([0, 0, 2], [0, 1, 2])).toBe(false);
    expect(grade([], [0])).toBe(false);
  });
  it("deduplicates completion and rejects unknown content", () => {
    const p = complete(complete(parseProgress(null), "a", ["a"]), "a", ["a"]);
    expect(p.completed).toEqual(["a"]);
    expect(() => complete(p, "unknown", ["a"])).toThrow();
  });
  it("recovers from malformed local storage", () => {
    expect(parseProgress({ completed: "all" }).completed).toEqual([]);
  });
});

import { fallback } from "../packages/ai-gateway/fallback";
it("uses neutral authored assistance outside an explicit lesson and keeps lesson hints intact", () => {
  const neutral = fallback({ mode: "explain", userMessage: "需要帮助" });
  expect(neutral.providerKind).toBe("fallback");
  expect(neutral.references).toEqual([]);
  expect(neutral.answer).not.toContain("源代码像食谱");
  const hint = fallback({
    mode: "hint",
    lessonId: lessons[0].id,
    userMessage: "需要提示",
  });
  expect(hint.answer).toBe(lessons[0].hints[0]);
});
