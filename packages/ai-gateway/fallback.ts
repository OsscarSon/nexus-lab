import { lessons } from "../../content/opensource";
import type { MentorRequest, MentorResponse } from "./contracts";
export function fallback(
  request: MentorRequest,
  reason = "ai-disabled",
): MentorResponse {
  const lesson = lessons.find((l) => l.id === request.lessonId);
  const answers = {
    explain:
      lesson?.segments[0].body ||
      "课程引导：先说清你要理解的概念，找一个具体输入与结果，再用一个小实验验证。没有关联课时时，这里提供通用学习步骤，不生成针对问题的 AI 回答。",
    hint:
      lesson?.hints[0] ||
      "学习提示：把任务拆成最小的一步，先预测结果，再观察实际反馈。需要时回到当前实验的任务说明。",
    debug:
      "引导式排错清单：记录预期与实际结果，缩小到最小重现步骤，检查输入与错误信息。这里没有执行你的代码，也没有自动诊断。",
    build:
      "引导式实践清单：选一个小目标 → 写下验收条件 → 完成最小步骤 → 运行检查 → 记录来源与学习证据。",
  };
  return {
    answer: answers[request.mode],
    providerKind: "fallback",
    isSimulation: false,
    reason,
    references: lesson?.references || [],
  };
}
