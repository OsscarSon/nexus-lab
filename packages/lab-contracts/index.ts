export type CheckResult = { passed: boolean; feedback: string };
export interface LabAdapter<State, Action> {
  id: string;
  kind: "simulation" | "real";
  initial: () => State;
  update: (state: State, action: Action) => State;
  evaluate: (state: State) => CheckResult;
}
export type GitState = {
  branch: string;
  working: string;
  staged: string | null;
  commits: { id: number; branch: string; message: string; content: string }[];
  message: string;
};
export type GitAction =
  | { type: "edit"; content: string }
  | { type: "branch"; name: string }
  | { type: "stage" }
  | { type: "commit"; message: string };
export const gitLab: LabAdapter<GitState, GitAction> = {
  id: "git",
  kind: "simulation",
  initial: () => ({
    branch: "main",
    working: "# My project",
    staged: null,
    commits: [],
    message: "任务：创建 feature 分支，修改 README，暂存并提交。",
  }),
  update: (state, action) => {
    switch (action.type) {
      case "edit":
        return {
          ...state,
          working: action.content,
          message: "工作区已修改。暂存区保持原样。",
        };
      case "branch":
        if (!/^[a-z][a-z0-9/-]{0,30}$/.test(action.name))
          return {
            ...state,
            message: "分支名需要小写字母开头，仅包含字母、数字、/ 或 -。",
          };
        return {
          ...state,
          branch: action.name,
          message: `切换到 ${action.name}（教学模拟）`,
        };
      case "stage":
        return {
          ...state,
          staged: state.working,
          message: "当前工作区快照已放入暂存区。",
        };
      case "commit":
        if (state.staged === null)
          return { ...state, message: "没有暂存内容，先执行 git add。" };
        if (!action.message.trim())
          return { ...state, message: "提交说明不能为空。" };
        return {
          ...state,
          commits: [
            ...state.commits,
            {
              id: state.commits.length + 1,
              branch: state.branch,
              message: action.message.trim().slice(0, 120),
              content: state.staged,
            },
          ],
          staged: null,
          message: "已生成模拟提交。工作区之后的修改不会自动加入该提交。",
        };
    }
  },
  evaluate: (state) => {
    const passed = state.commits.some(
      (c) => c.branch !== "main" && c.content.includes("Hello open source"),
    );
    return {
      passed,
      feedback: passed
        ? "挑战通过：你在独立分支提交了包含目标文本的快照。"
        : "还没完成：在非 main 分支，把 Hello open source 写入 README，再暂存并提交。",
    };
  },
};
export type Gate = "AND" | "OR" | "XOR" | "NOT";
export function gateOutput(gate: Gate, a: boolean, b: boolean): boolean {
  switch (gate) {
    case "AND":
      return a && b;
    case "OR":
      return a || b;
    case "XOR":
      return a !== b;
    case "NOT":
      return !a;
  }
}
export type LogicState = {
  gate: Gate;
  a: boolean;
  b: boolean;
  predictions: (boolean | null)[];
};
export const logicLab: LabAdapter<
  LogicState,
  | { type: "configure"; gate: Gate; a: boolean; b: boolean }
  | { type: "predict"; row: number; value: boolean }
> = {
  id: "logic",
  kind: "simulation",
  initial: () => ({
    gate: "AND",
    a: false,
    b: false,
    predictions: [null, null, null, null],
  }),
  update: (s, a) =>
    a.type === "configure"
      ? {
          ...s,
          ...a,
          predictions:
            a.gate === s.gate ? s.predictions : [null, null, null, null],
        }
      : {
          ...s,
          predictions: s.predictions.map((x, i) => (i === a.row ? a.value : x)),
        },
  evaluate: (s) => {
    const passed = s.predictions.every(
      (p, i) =>
        p !== null && p === gateOutput(s.gate, Boolean(i & 2), Boolean(i & 1)),
    );
    return {
      passed,
      feedback: passed
        ? "挑战通过：真值表全部正确。"
        : "检查每一行：AND 需要两个输入都为 1；OR 任一为 1；XOR 仅一个为 1；NOT 只反转 A。",
    };
  },
};
