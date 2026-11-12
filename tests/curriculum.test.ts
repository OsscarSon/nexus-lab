import { describe, it, expect } from "vitest";
import { baseCatalog, curriculum } from "../content/curriculum";
import { ref } from "../packages/curriculum/schema";
import {
  CurriculumRegistry,
  validateCatalog,
  key,
} from "../packages/curriculum/registry";
const fresh = () => structuredClone(baseCatalog());
describe("versioned shared catalog", () => {
  it("registers all ten academies and preserves six legacy IDs and URLs", () => {
    expect(curriculum.list("academy")).toHaveLength(10);
    expect(
      curriculum.lessons(ref("course", "course.opensource-literacy")),
    ).toHaveLength(6);
    expect(curriculum.get("lesson", "os-source")?.id).toBe("os-source");
    expect(curriculum.alias("/learn/opensource/foundations")?.id).toBe(
      "course.opensource-literacy",
    );
  });
  it("rejects duplicates", () => {
    const c = fresh();
    c.entities.push(c.entities[0]);
    expect(() => validateCatalog(c)).toThrow("Duplicate");
  });
  it("rejects missing references", () => {
    const c = fresh();
    c.aliases.push({ route: "/missing", ref: ref("lesson", "missing") });
    expect(() => validateCatalog(c)).toThrow("Missing reference");
  });
  it("rejects incompatible exact versions", () => {
    const c = fresh();
    c.aliases[0].ref.version = 2;
    expect(() => validateCatalog(c)).toThrow("Incompatible version");
  });
  it.each(["required", "recommended"] as const)(
    "rejects %s cycles including container edges",
    (kind) => {
      const c = fresh();
      c.dependencies.push({
        from: ref("lesson", "os-source"),
        to: ref("course", "course.opensource-literacy"),
        kind,
        rationale: "cycle",
      });
      expect(() => validateCatalog(c)).toThrow("Dependency cycle");
    },
  );
  it("allows related links without making them prerequisites", () => {
    const c = fresh();
    c.dependencies.push({
      from: ref("lesson", "os-source"),
      to: ref("course", "course.opensource-literacy"),
      kind: "related",
      rationale: "background",
    });
    expect(() => new CurriculumRegistry(c)).not.toThrow();
  });
  it("does not publish a course with unavailable prerequisites", () => {
    const c = fresh();
    c.dependencies.push({
      from: ref("lesson", "os-source"),
      to: ref("course", "course.ai-starter"),
      kind: "required",
      rationale: "not available",
    });
    expect(() => validateCatalog(c)).toThrow("unavailable");
  });
  it("deduplicates canonical content referenced twice and explains prerequisites", () => {
    const c = fresh();
    const module = c.entities.find((e) => e.kind === "module")!;
    if (module.kind === "module")
      module.lessonRefs.push(ref("lesson", "os-source"));
    c.dependencies.push({
      from: ref("lesson", "os-permissions"),
      to: ref("lesson", "os-source"),
      kind: "recommended",
      rationale: "先理解源码",
    });
    const r = new CurriculumRegistry(c);
    expect(r.lessons(ref("course", "course.opensource-literacy"))).toHaveLength(
      6,
    );
    expect(
      r.prerequisites(
        ref("lesson", "os-permissions"),
        new Set([key(ref("lesson", "os-source"))]),
      )[0],
    ).toMatchObject({ satisfied: true, rationale: "先理解源码" });
  });
  it("Zod rejects invalid assessments and block definitions", () => {
    const c = fresh();
    const a = c.entities.find((e) => e.kind === "assessment")!;
    if (a.kind === "assessment") a.correct = 99;
    expect(() => validateCatalog(c)).toThrow();
  });
  it("rejects an empty published path", () => {
    const c = fresh();
    const p = c.entities.find((e) => e.kind === "path" && e.id === "path.ai")!;
    p.status = "available";
    if (p.kind === "path") p.courseRefs = [];
    expect(() => validateCatalog(c)).toThrow("empty");
  });
});
