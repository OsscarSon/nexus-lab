import { curriculum } from "../../content/curriculum";
import type { Evidence } from "../../packages/curriculum/evidence";
export const exerciseProofs: Record<string, unknown> = {
  "shared-python-variables": { output: "14" },
  "shared-git-basics": {
    state: {
      branch: "feature",
      working: "Hello open source",
      staged: null,
      message: "committed",
      commits: [
        {
          id: 1,
          branch: "feature",
          message: "Welcome",
          content: "Hello open source",
        },
      ],
    },
  },
  "shared-api-basics": { method: "GET", path: "/status" },
  "shared-evidence-basics": ["观察", "解释", "预测"],
  "programming-expressions": 14,
  "ai-prompt-structure": {
    goal: "总结活动通知",
    audience: "小学生",
    constraint: "三句话",
  },
  "games-motion": [3, 3, 3, 3],
  "engineering-binary": [10, 5],
  "web-structure":
    '<h1>我的活动</h1><p>欢迎参加</p><button type="button">了解活动</button>',
  "future-sampling": [3, 4, 8],
  "games-score": ["collect", "collect", "collect"],
  "engineering-and": [false, false, false, true],
  "web-request": { method: "GET", path: "/weather" },
  "security-permissions": ["read:temperature"],
  "robotics-threshold": true,
  "future-models": 16,
  "workspace-budget": "=SUM(B2:B3)",
  "opensource-permission": ["开源许可", "源码可见，有用途限制", "授权不明确"],
};
export function evidenceFor(id: string): Evidence {
  const l = curriculum.get("lesson", id)!;
  return {
    kind: "lesson",
    id,
    version: l.version,
    completedAt: "2026-11-13T00:00:00.000Z",
    source: "assessment",
    proof: {
      exercise: Object.fromEntries(
        l.blocks
          .filter((b) => b.kind !== "repository")
          .map((b) => [b.id, exerciseProofs[id]]),
      ),
      answers: Object.fromEntries(
        l.assessmentRefs.map((r) => [
          r.id,
          curriculum.get("assessment", r.id)!.correct,
        ]),
      ),
    },
  };
}
