import { z } from "zod";
import { academies } from "./catalog";
const planSchema = z.record(
  z.string(),
  z.object({
    objectives: z.array(z.string()),
    beginner: z.string(),
    intermediate: z.string(),
    advanced: z.string(),
    prerequisites: z.string(),
    related: z.array(z.string()),
  }),
);
export const academyPlans = planSchema.parse({
  programming: {
    objectives: [
      "读懂程序的输入与输出",
      "用变量、循环和函数拆解问题",
      "用检查结果改进小工具",
    ],
    beginner: "编程思维与 Python 起步",
    intermediate: "数据处理与程序结构",
    advanced: "可测试的小工具项目",
    prerequisites: "零基础；从精选 Python 示例开始。",
    related: ["ai", "robotics"],
  },
  ai: {
    objectives: [
      "认识 AI 能力与局限",
      "设计有目标的提示并评估结果",
      "负责任地使用模型与数据",
    ],
    beginner: "AI 素养与提示设计",
    intermediate: "数据与模型评估",
    advanced: "有证据的 AI 应用项目",
    prerequisites: "入门概念无需编程；后续代码实践可参考 Python。",
    related: ["programming", "future"],
  },
  games: {
    objectives: [
      "理解规则与玩家反馈",
      "用互动原型验证想法",
      "逐步制作可体验的游戏作品",
    ],
    beginner: "游戏规则与互动入门",
    intermediate: "游戏状态与关卡设计",
    advanced: "小型游戏制作与发布",
    prerequisites: "零基础；代码课程将说明具体先修。",
    related: ["programming", "web"],
  },
  engineering: {
    objectives: [
      "理解二进制与逻辑运算",
      "用真值表验证逻辑关系",
      "认识硬件系统如何协作",
    ],
    beginner: "数字逻辑与逻辑门",
    intermediate: "计算机组成基础",
    advanced: "数字系统设计实践",
    prerequisites: "零基础；可先试逻辑门实验。",
    related: ["robotics", "programming"],
  },
  web: {
    objectives: [
      "理解网页与网络请求",
      "认识前端与服务端的边界",
      "理解部署与验证过程",
    ],
    beginner: "网页与 Web 基础",
    intermediate: "API 与服务端协作",
    advanced: "云端应用部署",
    prerequisites: "入门无需云账户；后续部署另行说明权限。",
    related: ["programming", "security"],
  },
  security: {
    objectives: [
      "认识网络连接与协议",
      "学会识别权限与数据风险",
      "在授权范围内练习安全思维",
    ],
    beginner: "网络与安全素养",
    intermediate: "协议、权限与防护",
    advanced: "安全评估与防御项目",
    prerequisites: "零基础；所有实验应处于授权环境。",
    related: ["web", "engineering"],
  },
  robotics: {
    objectives: [
      "理解感知、决策与执行",
      "处理简单的传感数据",
      "认识设备与软件的协作",
    ],
    beginner: "机器人与传感入门",
    intermediate: "数据与控制流程",
    advanced: "物联网系统项目",
    prerequisites: "入门不要求硬件；具体实验将标注设备条件。",
    related: ["engineering", "programming"],
  },
  future: {
    objectives: [
      "理解新技术的基本原理",
      "区分技术证据与宣传",
      "提出可以验证的探索问题",
    ],
    beginner: "新技术与证据思维",
    intermediate: "技术趋势比较与实验",
    advanced: "未来技术研究作品",
    prerequisites: "零基础；保持好奇，不强制编程先修。",
    related: ["ai", "engineering"],
  },
  workspace: {
    objectives: [
      "用单元格与公式表达问题",
      "拆解重复工作与流程",
      "验证自动化的结果和边界",
    ],
    beginner: "表格与公式基础",
    intermediate: "流程与 API 自动化",
    advanced: "可复用的工作流程项目",
    prerequisites: "零基础；公式实验无需连接 Google 账户。",
    related: ["web", "programming"],
  },
  opensource: {
    objectives: [
      "区分可见源码与开放许可",
      "理解维护者与社区协作",
      "核实来源并记录授权证据",
    ],
    beginner: "开源素养 M01",
    intermediate: "项目探索与协作",
    advanced: "贡献与维护实践",
    prerequisites: "零基础；无需 GitHub 账户或 API key。",
    related: ["programming", "web"],
  },
});
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
  if (id === "opensource")
    courses[0] = {
      ...courses[0],
      id: "os-m01",
      title: "开源素养 M01",
      status: "available",
      route: "/learn/opensource/foundations",
      minutes: 30,
      description: "六节短课、检查题与开源决策工作表。",
    };
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
