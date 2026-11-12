import { z } from "zod";
import { read, write } from "./storage";
import { lessons } from "../../../content/opensource";
import { pythonSamples } from "../../../content/python";
import { labCatalog } from "../../../content/experience";
import { parseProgress } from "../../../packages/lesson-engine";
import { gitLab, logicLab } from "../../../packages/lab-contracts";
import { evaluateFormula } from "../../../packages/formulas";
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
  const lesson = lessons.find((l) => path === "/lesson/" + l.id);
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
  const p = parseProgress(read("nexus-progress", null));
  return {
    ...p,
    completed: [
      ...new Set(p.completed.filter((id) => lessons.some((l) => l.id === id))),
    ],
  };
}
export type Artifact = {
  id: string;
  title: string;
  description: string;
  kind: "worksheet" | "lab" | "python";
  source: string;
  completedAt: string;
  data: unknown;
};
const dated = { completedAt: z.string().datetime() };
const gitState = z.object({
  branch: z.string(),
  working: z.string(),
  staged: z.string().nullable(),
  commits: z.array(
    z.object({
      id: z.number(),
      branch: z.string(),
      message: z.string(),
      content: z.string(),
    }),
  ),
  message: z.string(),
});
const logicState = z.object({
  gate: z.enum(["AND", "OR", "XOR", "NOT"]),
  a: z.boolean(),
  b: z.boolean(),
  predictions: z.array(z.boolean().nullable()).length(4),
});
export function readArtifacts(): Artifact[] {
  const result: Artifact[] = [];
  const worksheet = z
    .object({
      ...dated,
      answers: z.tuple([z.literal(0), z.literal(1), z.literal(2)]),
    })
    .safeParse(read("nexus-worksheet", null));
  if (worksheet.success)
    result.push({
      id: "worksheet",
      title: "开源决策工作表",
      description: "根据授权条款完成三个项目的分类。",
      kind: "worksheet",
      source: "/learn/opensource/assessment",
      completedAt: worksheet.data.completedAt,
      data: worksheet.data,
    });
  for (const id of ["git", "logic"] as const) {
    const raw = read("nexus-lab-" + id, null);
    if (id === "git") {
      const parsed = z.object({ ...dated, state: gitState }).safeParse(raw);
      if (parsed.success && gitLab.evaluate(parsed.data.state).passed)
        result.push({
          id,
          title: "Git 分支提交练习",
          description: "独立分支上的暂存与提交证据。",
          kind: "lab",
          source: "/lab/git",
          completedAt: parsed.data.completedAt,
          data: parsed.data,
        });
    } else {
      const parsed = z.object({ ...dated, state: logicState }).safeParse(raw);
      if (parsed.success && logicLab.evaluate(parsed.data.state).passed)
        result.push({
          id,
          title: "逻辑门真值表",
          description: "完整且正确的四行预测结果。",
          kind: "lab",
          source: "/lab/logic",
          completedAt: parsed.data.completedAt,
          data: parsed.data,
        });
    }
  }
  const sheet = z
    .object({ ...dated, formula: z.string().max(300) })
    .safeParse(read("nexus-lab-spreadsheet", null));
  if (sheet.success) {
    try {
      if (
        [
          { B2: "12", B3: "18" },
          { B2: "3", B3: "8" },
          { B2: "5", B3: "0" },
        ].every(
          (f) =>
            evaluateFormula(sheet.data.formula, f) ===
            Number(f.B2) + Number(f.B3),
        )
      )
        result.push({
          id: "spreadsheet",
          title: "活动预算公式",
          description: "在不同预算输入下通过求和检查。",
          kind: "lab",
          source: "/lab/spreadsheet",
          completedAt: sheet.data.completedAt,
          data: sheet.data,
        });
    } catch {
      /* invalid local evidence is not shown as completed */
    }
  }
  for (const sample of pythonSamples) {
    const parsed = z
      .object({ ...dated, output: z.literal(sample.expected) })
      .safeParse(read("nexus-python-" + sample.id, null));
    if (parsed.success)
      result.push({
        id: "python-" + sample.id,
        title: "Python · " + sample.title,
        description: "真实 Python 输出通过任务检查。",
        kind: "python",
        source: "/lab/python",
        completedAt: parsed.data.completedAt,
        data: parsed.data,
      });
  }
  return result.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
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
