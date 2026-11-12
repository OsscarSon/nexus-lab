import { z } from "zod";
import { curriculum } from "./curriculum";
import { academies } from "./catalog";
import { academyPlans } from "./academy-plans";
export { academyPlans };
export const labCatalog = z
  .array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      kind: z.string(),
      minutes: z.number(),
    }),
  )
  .parse([
    {
      id: "git",
      title: "Git 工作台",
      description: "把修改放进暂存区，完成一次独立分支提交。",
      kind: "教学模拟",
      minutes: 10,
    },
    {
      id: "logic",
      title: "逻辑门实验",
      description: "切换输入，预测并验证四种逻辑门的真值表。",
      kind: "教学模拟",
      minutes: 8,
    },
    {
      id: "python",
      title: "Python 微课程",
      description: "用真实 Python 探索变量、循环与函数。",
      kind: "真实 Python",
      minutes: 15,
    },
    {
      id: "spreadsheet",
      title: "公式实验",
      description: "计算活动预算，用不同数值验证你的公式。",
      kind: "本地公式计算",
      minutes: 8,
    },
  ]);
const base = {
  id: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  kind: z.enum(["course", "practice"]),
  minutes: z.number().optional(),
};
export const courseSchema = z.discriminatedUnion("status", [
  z.object({ ...base, status: z.literal("available"), route: z.string() }),
  z.object({ ...base, status: z.literal("planned") }),
  z.object({ ...base, status: z.literal("in-development") }),
]);
export type CourseEntry = z.infer<typeof courseSchema>;
export function academyCourses(id: string): CourseEntry[] {
  const plan = academyPlans[id];
  if (!plan) return [];
  const courses: CourseEntry[] = [
    {
      id: id + "-beginner",
      title: plan.beginner,
      description: "从基础概念到独立练习，逐步建立理解。",
      level: "beginner",
      kind: "course",
      status: "planned",
    },
    {
      id: id + "-intermediate",
      title: plan.intermediate,
      description: "连接基础知识，在情境中练习和验证。",
      level: "intermediate",
      kind: "course",
      status: "planned",
    },
    {
      id: id + "-advanced",
      title: plan.advanced,
      description: "以项目证据展示理解，形成可复用的作品。",
      level: "advanced",
      kind: "course",
      status: "planned",
    },
  ];
  const starter = curriculum.get("course", "course." + id + "-starter");
  if (starter?.status === "available")
    courses[0] = {
      ...courses[0],
      id: starter.id,
      title: starter.title,
      description: starter.description,
      status: "available",
      route: "/course/" + starter.id,
      minutes: curriculum
        .lessons({ kind: "course", id: starter.id, version: starter.version })
        .reduce((sum, l) => sum + l.estimatedMinutes, 0),
    };
  else if (starter?.status === "in-development")
    courses[0] = { ...courses[0], status: "in-development" };
  if (id === "opensource")
    courses.push({
      id: "os-m01",
      title: "开源素养 M01",
      description: "保留原六课、检查题与决策工作表。",
      level: "beginner",
      kind: "course",
      status: "available",
      route: "/learn/opensource/foundations",
      minutes: 30,
    });
  const practices: Record<string, string[]> = {
    programming: ["python", "git"],
    ai: ["python"],
    games: ["git"],
    engineering: ["logic"],
    web: ["git"],
    security: ["git"],
    robotics: ["python", "logic"],
    future: [],
    workspace: ["spreadsheet"],
    opensource: ["git"],
  };
  for (const labId of practices[id] || []) {
    const lab = labCatalog.find((l) => l.id === labId)!;
    courses.push({
      id: "practice-" + labId,
      title: lab.title,
      description: "可选共享练习 · " + lab.description,
      level: "beginner",
      kind: "practice",
      status: "available",
      route: "/lab/" + labId,
      minutes: lab.minutes,
    });
  }
  return courses.map((c) => courseSchema.parse(c));
}
export function academyAvailability(id: string) {
  const entries = academyCourses(id);
  return entries.some((c) => c.status === "available" && c.kind === "course")
    ? "课程可学习"
    : entries.some((c) => c.status === "available")
      ? "实践可用 · 课程规划中"
      : entries.some((c) => c.status === "in-development")
        ? "课程开发中"
        : "课程规划中";
}
export const levelLabels = {
  beginner: "初阶",
  intermediate: "进阶",
  advanced: "高阶",
} as const;
export function findAcademy(id: string) {
  return academies.find((a) => a.id === id);
}

export const publicationLabels = {
  available: "已发布",
  "in-development": "开发中",
  planned: "规划中",
} as const;
