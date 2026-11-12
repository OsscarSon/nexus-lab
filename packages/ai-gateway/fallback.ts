import { lessons } from "../../content/opensource";
import type { MentorRequest, MentorResponse } from "./contracts";
export function fallback(
  request: MentorRequest,
  reason = "ai-disabled",
): MentorResponse {
  const lesson = lessons.find((l) => l.id === request.lessonId) || lessons[0];
  const answers = {
    explain: lesson.segments[0].body,
    hint: lesson.hints[0],
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
    references: lesson.references,
  };
}
