import { academies } from "./catalog";
import { pythonSamples } from "./python";
import { academyPlans } from "./academy-plans";
import { lessons as legacyLessons } from "./opensource";
import { ref, type Catalog } from "../packages/curriculum/schema";
import { CurriculumRegistry } from "../packages/curriculum/registry";
export const legacyLessonIds = legacyLessons.map((l) => l.id);
export function baseCatalog(): Catalog {
  const entities: unknown[] = [];
  const add = (
    kind: string,
    id: string,
    title: string,
    extra: object = {},
    status = "available",
  ) => entities.push({ kind, id, title, version: 1, status, ...extra });
  for (const a of academies) {
    add("academy", a.id, a.title, {
      description: a.description,
      pathRefs: [
        ref("path", "path." + a.id),
        ...(a.id === "opensource"
          ? [ref("path", "path.opensource-literacy")]
          : []),
      ],
    });
    add(
      "path",
      "path." + a.id,
      a.title + "入门路径",
      {
        academyRefs: [ref("academy", a.id)],
        outcomes: academyPlans[a.id].objectives,
        courseRefs: [ref("course", "course." + a.id + "-starter")],
        projectRefs: [],
      },
      "planned",
    );
    add(
      "course",
      "course." + a.id + "-starter",
      academyPlans[a.id].beginner,
      {
        description: academyPlans[a.id].objectives[0],
        outcomes: academyPlans[a.id].objectives,
        moduleRefs: [],
        assessmentRefs: [],
        projectRefs: [],
        completionRule: "all-required",
      },
      "planned",
    );
  }
  for (const [id, title] of [
    ["topic.git", "Git 版本控制"],
    ["topic.github", "GitHub 协作"],
    ["topic.python", "Python"],
    ["topic.apis", "API 请求与响应"],
    ["topic.cloud-deployment", "云部署"],
    ["topic.licenses", "授权与来源"],
    ["topic.evidence", "证据与验证"],
  ])
    add("topic", id, title, {
      outcomes: ["建立可验证的" + title + "基础理解"],
      resourceRefs: [],
    });
  for (const [id, labId, sampleId, runtime, title] of [
    ["lab.git", "git", undefined, "simulation", "Git 暂存与提交"],
    ["lab.logic", "logic", undefined, "simulation", "逻辑门真值表"],
    ["lab.spreadsheet", "spreadsheet", undefined, "formula", "预算公式"],
    ["lab.python-variables", "python", "variables", "python", "Python 变量"],
    ["lab.python-loops", "python", "loops", "python", "Python 循环"],
    ["lab.python-functions", "python", "functions", "python", "Python 函数"],
  ] as const)
    add("lab", id, title, {
      labId,
      ...(sampleId
        ? {
            sampleId,
            expectedOutput: pythonSamples.find(
              (sample) => sample.id === sampleId,
            )!.expected,
          }
        : {}),
      runtime,
      route: "/lab/" + labId,
    });
  add("path", "path.opensource-literacy", "开源素养 M01", {
    academyRefs: [ref("academy", "opensource")],
    outcomes: ["理解许可、社区与可信来源"],
    courseRefs: [ref("course", "course.opensource-literacy")],
    projectRefs: [],
  });
  add("course", "course.opensource-literacy", "开源素养 M01", {
    description: "六节原有短课与许可决策练习",
    outcomes: ["理解许可、社区与可信来源"],
    moduleRefs: [ref("module", "os-m01")],
    assessmentRefs: [],
    projectRefs: [ref("project", "project.legacy-worksheet")],
    completionRule: "all-required",
  });
  add("module", "os-m01", "开源素养", {
    outcomes: ["理解许可、社区与可信来源"],
    lessonRefs: legacyLessons.map((l) => ref("lesson", l.id)),
    assessmentRefs: [],
  });
  for (const l of legacyLessons) {
    add("assessment", "assessment." + l.id, l.title + "检查题", {
      question: l.question,
      options: l.options,
      correct: l.correct,
      explanation: l.explanation,
    });
    add("lesson", l.id, l.title, {
      objectives: l.objectives,
      summary: l.summary,
      segments: l.segments,
      example: l.example,
      estimatedMinutes: l.estimatedMinutes,
      topicRefs: [ref("topic", "topic.licenses")],
      assessmentRefs: [ref("assessment", "assessment." + l.id)],
      blocks:
        l.id === "os-source"
          ? [{ kind: "repository", id: "block.repo-files" }]
          : [],
      requiresExercise: false,
      legacyCompatible: true,
      hints: l.hints,
      references: l.references,
      nextRefs: [],
    });
  }
  add("project", "project.legacy-worksheet", "开源决策工作表", {
    description: "原有三个许可情景的判断记录",
    rubric: ["正确识别开放许可、用途限制和授权不明"],
    completionRefs: [],
  });
  return {
    schemaVersion: 1,
    entities: entities as Catalog["entities"],
    dependencies: [],
    aliases: [
      {
        route: "/learn/opensource/foundations",
        ref: ref("course", "course.opensource-literacy"),
      },
    ],
  };
}
export const curriculum = new CurriculumRegistry(baseCatalog());
