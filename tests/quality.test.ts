import { it, expect } from "vitest";
import { courseProgress, emptyLedger } from "../packages/curriculum/evidence";
import { evidenceFor } from "./fixtures/curriculum-proofs";
import { ref } from "../packages/curriculum/schema";
import { curriculum } from "../content/curriculum";
import { passesQuality } from "../packages/curriculum/quality";
import { validateCatalog } from "../packages/curriculum/registry";
import { checkQualityInteraction } from "../packages/curriculum/quality-evidence";
import {
  binaryValue,
  samplePoints,
  parseTeachingHTML,
} from "../packages/curriculum/quality-models";
it("enforces both quality thresholds and holds AI and legacy M01 as development", () => {
  expect(passesQuality([5, 5, 5, 5, 5, 3])).toBe(false);
  expect(passesQuality([4, 4, 4, 4, 4, 4])).toBe(false);
  expect(passesQuality([4, 4, 4, 4, 4, 5])).toBe(true);
  const courses = curriculum.list("course");
  expect(courses.filter((c) => c.quality?.state === "published")).toHaveLength(
    9,
  );
  expect(curriculum.get("course", "course.ai-starter")?.quality?.state).toBe(
    "in-development",
  );
  expect(
    curriculum.get("course", "course.opensource-literacy")?.quality?.state,
  ).toBe("in-development");
  const c = structuredClone(curriculum.catalog);
  const first = c.entities.find((e) => e.kind === "course")!;
  if (first.kind !== "course") throw Error("fixture");
  first.quality = {
    state: "published",
    scores: [4, 4, 4, 4, 4, 4],
    reviewedAt: "2026-11-13",
    scope: "test",
  };
  expect(() => validateCatalog(c)).toThrow("quality gate");
});
it("replays movement and prevents a speed-only change from faking the challenge", () => {
  expect(checkQualityInteraction("motion", [3, 3, 3, 3])).toBe(true);
  expect(
    checkQualityInteraction("motion", [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
  ).toBe(false);
  expect(checkQualityInteraction("motion", [3, 3])).toBe(false);
  expect(checkQualityInteraction("motion", [100])).toBe(false);
});
it("checks all sixteen unsigned bit patterns and the independent second target", () => {
  for (let n = 0; n < 16; n++)
    expect(binaryValue([8, 4, 2, 1].map((v) => !!(n & v)))).toBe(n);
  expect(checkQualityInteraction("binary", [10, 5])).toBe(true);
  expect(checkQualityInteraction("binary", [5])).toBe(false);
});
it("renders only a bounded text-based markup subset and rejects executable input", () => {
  expect(
    checkQualityInteraction(
      "markup",
      '<h1>活动</h1><p>说明</p><button type="button">了解</button>',
    ),
  ).toBe(true);
  for (const s of [
    "<script>alert(1)</script>",
    '<h1 onclick="x()">Hello</h1>',
    "<img src=x onerror=alert(1)>",
  ])
    expect(parseTeachingHTML(s).valid).toBe(false);
});
it("shows critical-frequency sampling loss and requires comparison before choosing 8 Hz", () => {
  expect(samplePoints(4).every((p) => Math.abs(p.y) < 1e-10)).toBe(true);
  expect(samplePoints(8).some((p) => Math.abs(p.y) > 0.9)).toBe(true);
  expect(checkQualityInteraction("sampling", [3, 4, 8])).toBe(true);
  expect(checkQualityInteraction("sampling", [8])).toBe(false);
  expect(checkQualityInteraction("sampling", [3, 8, 4])).toBe(false);
});
it("keeps all legacy lesson IDs and canonical shared sources with explicit prerequisites and sources", () => {
  for (const id of [
    "os-source",
    "os-permissions",
    "shared-python-variables",
    "shared-api-basics",
  ])
    expect(curriculum.get("lesson", id)).toBeDefined();
  for (const l of curriculum
    .list("lesson")
    .filter((l) => !l.legacyCompatible)) {
    expect(l.prerequisites?.length).toBeGreaterThan(0);
    expect(l.references.length).toBeGreaterThan(0);
    expect(l.challenge).toBeTruthy();
  }
});

it("preserves original v1 course, module, path and project requirements while new challenges use new IDs", () => {
  const old: Record<string, string[]> = {
    games: ["games-score", "shared-git-basics"],
    engineering: ["engineering-and"],
    web: ["web-request", "shared-api-basics"],
    future: ["shared-evidence-basics", "future-models"],
  };
  for (const [academy, ids] of Object.entries(old)) {
    const ledger = { ...emptyLedger(), evidence: ids.map(evidenceFor) };
    for (const kind of ["course", "module", "project"] as const) {
      const id = kind + "." + academy + "-starter";
      expect(curriculum.lessons(ref(kind, id)).map((l) => l.id)).toEqual(ids);
      expect(courseProgress(ref(kind, id), ledger, curriculum).passed).toBe(
        true,
      );
      expect(
        courseProgress(
          ref(kind, kind + "." + academy + "-quality"),
          ledger,
          curriculum,
        ).passed,
      ).toBe(false);
    }
    expect(
      courseProgress(ref("path", "path." + academy), ledger, curriculum).passed,
    ).toBe(true);
  }
});
