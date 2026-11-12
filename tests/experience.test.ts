import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { academies } from "../content/catalog";
import {
  academyCourses,
  academyPlans,
  academyAvailability,
} from "../content/experience";
import {
  readArtifacts,
  readVisits,
  recordVisit,
  readLearning,
} from "../apps/web/src/activity";
import { gitLab } from "../packages/lab-contracts";
let memory: Map<string, string>;
beforeEach(() => {
  memory = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memory.get(key) || null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  });
});
afterEach(() => vi.unstubAllGlobals());
describe("equal academy presentation", () => {
  it("gives all ten academies the same objectives and three-level structure", () => {
    expect(Object.keys(academyPlans)).toHaveLength(10);
    for (const a of academies) {
      expect(academyPlans[a.id].objectives.length).toBeGreaterThan(1);
      expect(new Set(academyCourses(a.id).map((c) => c.level))).toEqual(
        new Set(["beginner", "intermediate", "advanced"]),
      );
      expect(academyAvailability(a.id)).toBeTruthy();
    }
  });
  it("never gives planned courses executable routes and references real shared labs", () => {
    for (const a of academies)
      for (const c of academyCourses(a.id)) {
        if (c.status !== "available") expect("route" in c).toBe(false);
        else
          expect(c.route).toMatch(
            /^\/(lab\/(git|logic|python|spreadsheet)|learn\/opensource\/foundations)$/,
          );
      }
  });
});
describe("existing learning evidence", () => {
  it("starts empty and does not invent visits, progress or artifacts", () => {
    expect(readArtifacts()).toEqual([]);
    expect(readVisits()).toEqual([]);
    expect(readLearning().completed).toEqual([]);
    expect(memory.size).toBe(0);
  });
  it("reads original worksheet, formula and Python records without rewriting them", () => {
    memory.set(
      "nexus-worksheet",
      JSON.stringify({
        version: 1,
        answers: [0, 1, 2],
        completedAt: "2026-11-13T01:00:00.000Z",
      }),
    );
    memory.set(
      "nexus-python-variables",
      JSON.stringify({ output: "14", completedAt: "2026-11-13T02:00:00.000Z" }),
    );
    memory.set(
      "nexus-lab-spreadsheet",
      JSON.stringify({
        formula: "=SUM(B2:B3)",
        completedAt: "2026-11-13T03:00:00.000Z",
      }),
    );
    const before = new Map(memory);
    expect(readArtifacts().map((a) => a.id)).toEqual([
      "spreadsheet",
      "python-variables",
      "worksheet",
    ]);
    expect(memory).toEqual(before);
  });
  it("shows Git evidence only after the original challenge is actually passed", () => {
    let state = gitLab.initial();
    memory.set(
      "nexus-lab-git",
      JSON.stringify({ completedAt: "2026-11-13T00:00:00.000Z", state }),
    );
    expect(readArtifacts()).toEqual([]);
    state = gitLab.update(state, { type: "branch", name: "feature" });
    state = gitLab.update(state, {
      type: "edit",
      content: "Hello open source",
    });
    state = gitLab.update(state, { type: "stage" });
    state = gitLab.update(state, { type: "commit", message: "Welcome" });
    memory.set(
      "nexus-lab-git",
      JSON.stringify({ completedAt: "2026-11-13T00:00:00.000Z", state }),
    );
    expect(readArtifacts()[0].id).toBe("git");
  });
  it("keeps visits separate from completion and rejects malformed data without deleting it", () => {
    memory.set(
      "nexus-progress",
      JSON.stringify({
        version: 1,
        completed: ["os-source", "os-source", "future-id"],
      }),
    );
    const before = memory.get("nexus-progress");
    expect(readLearning().completed).toEqual(["os-source"]);
    recordVisit("/lab/python");
    recordVisit("/lab/python");
    recordVisit("/lab/not-real");
    expect(readVisits()).toHaveLength(1);
    expect(readArtifacts()).toHaveLength(0);
    expect(memory.get("nexus-progress")).toBe(before);
    memory.set("nexus-worksheet", '{"completedAt":true,"answers":[0,0,0]}');
    expect(readArtifacts()).toEqual([]);
    expect(memory.has("nexus-worksheet")).toBe(true);
  });
});

import { courseSchema, publicationLabels } from "../content/experience";
it("distinguishes published, developing and planned courses independently of learner completion", () => {
  const base = {
    id: "neutral-course",
    title: "课程",
    description: "课程说明",
    level: "beginner",
    kind: "course",
  };
  expect(courseSchema.safeParse({ ...base, status: "available" }).success).toBe(
    false,
  );
  expect(courseSchema.parse({ ...base, status: "in-development" }).status).toBe(
    "in-development",
  );
  expect(courseSchema.parse({ ...base, status: "planned" }).status).toBe(
    "planned",
  );
  expect(Object.values(publicationLabels)).toEqual([
    "已发布",
    "开发中",
    "规划中",
  ]);
});
