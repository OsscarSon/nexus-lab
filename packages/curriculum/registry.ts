import {
  catalogSchema,
  type Catalog,
  type Entity,
  type ContentRef,
  type Kind,
} from "./schema";
export const key = (r: Pick<ContentRef, "kind" | "id">) => r.kind + ":" + r.id;
export function references(e: Entity): ContentRef[] {
  switch (e.kind) {
    case "academy":
      return e.pathRefs;
    case "topic":
      return e.resourceRefs;
    case "path":
      return [...e.academyRefs, ...e.courseRefs, ...e.projectRefs];
    case "course":
      return [...e.moduleRefs, ...e.assessmentRefs, ...e.projectRefs];
    case "module":
      return [...e.lessonRefs, ...e.assessmentRefs];
    case "lesson":
      return [
        ...e.topicRefs,
        ...e.assessmentRefs,
        ...e.nextRefs,
        ...e.blocks.flatMap((b) =>
          b.kind === "lab-evidence" ? [b.labRef] : [],
        ),
      ];
    case "project":
      return e.completionRefs;
    default:
      return [];
  }
}
function children(e: Entity): ContentRef[] {
  switch (e.kind) {
    case "path":
      return [...e.courseRefs, ...e.projectRefs];
    case "course":
      return [...e.moduleRefs, ...e.assessmentRefs];
    case "module":
      return [...e.lessonRefs, ...e.assessmentRefs];
    case "lesson":
      return [
        ...e.assessmentRefs,
        ...e.blocks.flatMap((b) =>
          b.kind === "lab-evidence" ? [b.labRef] : [],
        ),
      ];
    case "project":
      return e.completionRefs;
    default:
      return [];
  }
}
export function validateCatalog(input: unknown): Catalog {
  const catalog = catalogSchema.parse(input);
  const index = new Map<string, Entity>();
  for (const e of catalog.entities) {
    if (index.has(key(e))) throw Error("Duplicate content ID: " + key(e));
    index.set(key(e), e);
  }
  function check(r: ContentRef) {
    const target = index.get(key(r));
    if (!target) throw Error("Missing reference: " + key(r));
    if (target.version !== r.version)
      throw Error("Incompatible version: " + key(r));
    return target;
  }
  const edges = new Map<string, string[]>();
  for (const e of catalog.entities) {
    references(e).forEach(check);
    edges.set(key(e), children(e).map(key));
    if (e.kind === "lesson") {
      for (const b of e.blocks) {
        if (
          b.kind === "permissions" &&
          b.expected.some((value) => !b.options.includes(value))
        )
          throw Error("Unanswerable permissions exercise");
        if (
          b.kind === "classification" &&
          b.claims.some((c) => !b.categories.includes(c.category))
        )
          throw Error("Unanswerable classification exercise");
      }
    }
    if (
      e.kind === "lab" &&
      e.status === "available" &&
      e.runtime === "python" &&
      !e.expectedOutput
    )
      throw Error("Published Python lab lacks expected output");
    if (e.status === "available") {
      if (
        ["path", "course", "module"].includes(e.kind) &&
        children(e).length === 0
      )
        throw Error("Published container is empty: " + key(e));
      if (
        e.kind === "lesson" &&
        (!e.assessmentRefs.length ||
          (e.requiresExercise &&
            !e.blocks.some((b) => b.kind !== "repository")))
      )
        throw Error("Published lesson lacks verifiable evidence: " + e.id);
      for (const r of children(e))
        if (check(r).status !== "available")
          throw Error(
            "Published content requires unavailable content: " + key(r),
          );
    }
  }
  for (const d of catalog.dependencies) {
    const from = check(d.from),
      to = check(d.to);
    if (
      d.kind !== "related" &&
      [from.kind, to.kind].some((k) => k === "academy" || k === "topic")
    )
      throw Error("Prerequisites must reference assessable learning content");
    if (d.kind !== "related") edges.get(key(from))!.push(key(to));
    if (
      d.kind === "required" &&
      from.status === "available" &&
      to.status !== "available"
    )
      throw Error("Required prerequisite is unavailable: " + key(to));
  }
  const seen = new Set<string>(),
    visiting = new Set<string>();
  function visit(node: string) {
    if (visiting.has(node)) throw Error("Dependency cycle: " + node);
    if (seen.has(node)) return;
    visiting.add(node);
    for (const next of edges.get(node) || []) visit(next);
    visiting.delete(node);
    seen.add(node);
  }
  for (const e of catalog.entities) visit(key(e));
  const aliases = new Set<string>();
  for (const alias of catalog.aliases) {
    check(alias.ref);
    if (aliases.has(alias.route))
      throw Error("Duplicate route alias: " + alias.route);
    aliases.add(alias.route);
  }
  return catalog;
}
export class CurriculumRegistry {
  readonly catalog: Catalog;
  private index: Map<string, Entity>;
  constructor(input: unknown) {
    this.catalog = validateCatalog(input);
    this.index = new Map(this.catalog.entities.map((e) => [key(e), e]));
  }
  get<K extends Kind>(
    kind: K,
    id: string,
  ): Extract<Entity, { kind: K }> | undefined {
    return this.index.get(key({ kind, id })) as
      | Extract<Entity, { kind: K }>
      | undefined;
  }
  resolve(r: ContentRef) {
    const e = this.index.get(key(r));
    if (!e || e.version !== r.version)
      throw Error("Unresolvable reference: " + key(r));
    return e;
  }
  list<K extends Kind>(kind: K): Extract<Entity, { kind: K }>[] {
    return this.catalog.entities.filter((e) => e.kind === kind) as Extract<
      Entity,
      { kind: K }
    >[];
  }
  requirements(r: ContentRef): ContentRef[] {
    const result = new Map<string, ContentRef>(),
      visiting = new Set<string>();
    const walk = (node: ContentRef) => {
      if (visiting.has(key(node))) return;
      visiting.add(key(node));
      const e = this.resolve(node);
      if (["lesson", "lab", "assessment"].includes(e.kind))
        result.set(key(e), { kind: e.kind, id: e.id, version: e.version });
      else for (const c of children(e)) walk(c);
      for (const d of this.catalog.dependencies.filter(
        (d) => d.kind === "required" && key(d.from) === key(node),
      ))
        walk(d.to);
    };
    walk(r);
    return [...result.values()];
  }
  lessons(r: ContentRef) {
    return this.requirements(r)
      .filter((r) => r.kind === "lesson")
      .map((r) => this.get("lesson", r.id)!);
  }
  prerequisites(r: ContentRef, completed: ReadonlySet<string>) {
    return this.catalog.dependencies
      .filter((d) => key(d.from) === key(r))
      .map((d) => ({
        ...d,
        title: this.resolve(d.to).title,
        satisfied: this.requirements(d.to).every((item) =>
          completed.has(key(item)),
        ),
      }));
  }
  alias(route: string) {
    const entry = this.catalog.aliases.find((a) => a.route === route);
    return entry && this.resolve(entry.ref);
  }
}
