import { z } from "zod";
import { read, write } from "./storage";

import { readLegacyArtifacts, type Artifact } from "./legacy-evidence";
import {
  readCurriculumProgress,
  compatibleProgress,
} from "./curriculum-storage";
import {
  courseProgress,
  completedKeys,
} from "../../../packages/curriculum/evidence";
import { ref } from "../../../packages/curriculum/schema";
import { curriculum } from "../../../content/curriculum";
import { labCatalog } from "../../../content/experience";

const visitSchema = z.object({
  path: z.string(),
  title: z.string(),
  kind: z.enum(["lesson", "lab", "project"]),
  at: z.string().datetime(),
});
export type Visit = z.infer<typeof visitSchema>;
export function readVisits(): Visit[] {
  const data = z.array(visitSchema).safeParse(read("nexus-ui-history", []));
  return data.success
    ? data.data.filter((v) => routeLabel(v.path)).slice(0, 12)
    : [];
}
export function routeLabel(
  path: string,
): { title: string; kind: Visit["kind"] } | undefined {
  const lesson = curriculum
    .list("lesson")
    .find((l) => path.split("?")[0] === "/lesson/" + l.id);
  if (lesson) return { title: lesson.title, kind: "lesson" };
  const lab = labCatalog.find(
    (l) =>
      path === "/lab/" + l.id ||
      (l.id === "git" && path === "/opensource/git-playground"),
  );
  if (lab) return { title: lab.title, kind: "lab" };
  const project = readArtifacts().find((a) => path === "/projects/" + a.id);
  if (project) return { title: project.title, kind: "project" };
}
export function recordVisit(path: string) {
  const entry = routeLabel(path);
  if (!entry) return;
  write(
    "nexus-ui-history",
    [
      { ...entry, path, at: new Date().toISOString() },
      ...readVisits().filter((v) => v.path !== path),
    ].slice(0, 12),
  );
}
export function readLearning() {
  return compatibleProgress();
}
export type { Artifact } from "./legacy-evidence";
export function readArtifacts(): Artifact[] {
  const legacy = readLegacyArtifacts();
  const ledger = readCurriculumProgress();
  const completed = completedKeys(ledger, curriculum);
  const projects = curriculum
    .list("project")
    .filter(
      (p) =>
        p.id !== "project.legacy-worksheet" &&
        p.status === "available" &&
        courseProgress(ref("project", p.id), ledger, curriculum).passed,
    )
    .flatMap((p) => {
      const requirements = curriculum.requirements(ref("project", p.id));
      const evidence = ledger.evidence.filter(
        (e) =>
          completed.has(e.kind + ":" + e.id) &&
          requirements.some(
            (r) =>
              r.kind === e.kind && r.id === e.id && r.version === e.version,
          ),
      );
      const date = evidence
        .map((e) => e.completedAt)
        .filter((d): d is string => Boolean(d))
        .sort()
        .at(-1);
      if (!date) return [];
      return [
        {
          id: p.id,
          title: p.title,
          description: p.description,
          kind: "curriculum" as const,
          source:
            "/course/" +
            (curriculum
              .list("course")
              .find((c) => c.projectRefs.some((r) => r.id === p.id))?.id || ""),
          completedAt: date,
          data: {
            projectId: p.id,
            version: p.version,
            rubric: p.rubric,
            evidence,
          },
        },
      ];
    });
  return [...legacy, ...projects].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
}
export function exportArtifact(artifact: Artifact) {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          format: "nexus-learning-evidence",
          version: 1,
          title: artifact.title,
          completedAt: artifact.completedAt,
          evidence: artifact.data,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nexus-" + artifact.id + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
