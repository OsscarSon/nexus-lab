import { it, expect, describe } from "vitest";
import { starterInventory } from "../content/starter-curriculum";
import { curriculum } from "../content/curriculum";
import { ref } from "../packages/curriculum/schema";
import {
  emptyLedger,
  validateEvidence,
  courseProgress,
  mergeLedgers,
  checkInteraction,
  type Ledger,
} from "../packages/curriculum/evidence";
import { evidenceFor, exerciseProofs } from "./fixtures/curriculum-proofs";
import { fallback } from "../packages/ai-gateway/fallback";
describe("ten authored starter modules", () => {
  it.each(starterInventory)(
    "$academyId has a real module, exact next lessons, exercise feedback and evidence",
    (item) => {
      const c = curriculum.get("course", item.courseId)!;
      expect(c.status).toBe("available");
      const lessons = curriculum.lessons(ref("course", c.id));
      expect(lessons.map((l) => l.id)).toEqual(item.lessonIds);
      let ledger: Ledger = emptyLedger();
      for (const l of lessons) {
        expect(l.objectives.length).toBeGreaterThan(0);
        expect(l.segments[0].body.length).toBeGreaterThan(60);
        expect(l.example.length).toBeGreaterThan(30);
        expect(l.requiresExercise).toBe(true);
        expect(l.blocks).toHaveLength(1);
        expect(
          checkInteraction(l.blocks[0], exerciseProofs[l.id], curriculum)
            .passed,
        ).toBe(true);
        expect(
          checkInteraction(l.blocks[0], undefined, curriculum).passed,
        ).toBe(false);
        expect(validateEvidence(evidenceFor(l.id), curriculum)).toBe(true);
        expect(
          validateEvidence(
            { ...evidenceFor(l.id), proof: { exercise: {}, answers: {} } },
            curriculum,
          ),
        ).toBe(false);
        expect(
          l.nextRefs.some((r) => curriculum.resolve(r).status === "available"),
        ).toBe(true);
        ledger = mergeLedgers(ledger, {
          ...emptyLedger(),
          evidence: [evidenceFor(l.id)],
        });
      }
      expect(
        courseProgress(ref("course", c.id), ledger, curriculum),
      ).toMatchObject({ passed: true, total: lessons.length });
      const project = curriculum.get("project", c.projectRefs[0].id)!;
      expect(
        courseProgress(ref("project", project.id), ledger, curriculum).passed,
      ).toBe(true);
    },
  );
  it("shares the same canonical API lesson across web, robotics and workspace with once-only credit", () => {
    const shared = evidenceFor("shared-api-basics");
    let ledger = mergeLedgers(
      { ...emptyLedger(), evidence: [shared] },
      { ...emptyLedger(), evidence: [shared] },
    );
    expect(ledger.evidence).toHaveLength(1);
    for (const a of ["web", "robotics", "workspace"])
      expect(
        courseProgress(ref("path", "path." + a), ledger, curriculum).completed,
      ).toBe(1);
    ledger = mergeLedgers(ledger, {
      ...emptyLedger(),
      evidence: [evidenceFor("web-request"), evidenceFor("web-structure")],
    });
    expect(
      courseProgress(ref("course", "course.web-starter"), ledger, curriculum)
        .passed,
    ).toBe(true);
    expect(
      courseProgress(
        ref("course", "course.robotics-starter"),
        ledger,
        curriculum,
      ).passed,
    ).toBe(false);
  });
  it("uses the same published lesson context for Mentor without claiming live generation", () => {
    const r = fallback({
      lessonId: "security-permissions",
      mode: "explain",
      userMessage: "什么是最小权限",
    });
    expect(r.providerKind).toBe("fallback");
    expect(r.answer).toContain("最小权限");
    expect(r.answer).not.toContain("源代码像食谱");
  });
});
