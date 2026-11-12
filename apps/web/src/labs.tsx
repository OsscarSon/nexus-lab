import { Mentor } from "./mentor";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  gitLab,
  logicLab,
  gateOutput,
  type Gate,
  type LabAdapter,
} from "../../../packages/lab-contracts";
import { write } from "./storage";
const PythonLab = lazy(() => import("./python"));
const Spreadsheet = lazy(() => import("./spreadsheet"));
export function LabDirectory() {
  return (
    <>
      <span className="eyebrow">LEARNING BY DOING</span>
      <h1>把想法，变成亲手的发现。</h1>
      <p>安全的教学模拟，清楚的任务，可验证的结果。</p>
      <div className="grid">
        {[
          ["git", "⌥", "Git 工作台", "理解工作区、暂存与提交。"],
          ["logic", "⊞", "逻辑门实验", "用输入与真值表理解数字逻辑。"],
          ["python", "⌘", "Python 微课程", "真实 Python · 变量、循环与函数。"],
          ["spreadsheet", "▦", "公式实验", "实际计算预算，验证公式。"],
        ].map(([id, icon, title, description]) => (
          <Link className="card academy" key={id} to={"/lab/" + id}>
            <span className="academy-icon">{icon}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <span className="tag">
              {id === "python"
                ? "真实 Python"
                : id === "spreadsheet"
                  ? "本地公式计算"
                  : "教学模拟"}{" "}
              · 初学者 · 开始 →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
function useLab<S, A>(adapter: LabAdapter<S, A>) {
  const [state, setState] = useState(adapter.initial);
  const [history, setHistory] = useState<S[]>([]);
  const [feedback, setFeedback] = useState("");
  return {
    state,
    feedback,
    dispatch: (action: A) => {
      setHistory((h) => [...h.slice(-49), state]);
      setState(adapter.update(state, action));
      setFeedback("");
    },
    reset: () => {
      setState(adapter.initial());
      setHistory([]);
      setFeedback("已重置，可重新挑战。");
    },
    undo: () => {
      if (history.length) {
        setState(history[history.length - 1]);
        setHistory(history.slice(0, -1));
        setFeedback("已撤销上一步。");
      }
    },
    canUndo: history.length > 0,
    check: () => {
      const result = adapter.evaluate(state);
      setFeedback(
        result.feedback +
          (result.passed
            ? write("nexus-lab-" + adapter.id, {
                version: 1,
                completedAt: new Date().toISOString(),
                state,
              })
              ? " 学习证据已保存在本机。"
              : " 存储不可用，未保存。"
            : ""),
      );
    },
  };
}
function Workspace({
  title,
  children,
  feedback,
  onReset,
  onUndo,
  canUndo,
  onCheck,
}: {
  title: string;
  children: ReactNode;
  feedback: string;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onCheck: () => void;
}) {
  return (
    <section className="prose">
      <Link to="/lab">← 所有实验</Link>
      <p className="eyebrow">INTERACTIVE LAB · 教学模拟</p>
      <h1>{title}</h1>
      {children}
      <div className="row">
        <button onClick={onCheck}>检查挑战</button>
        <button className="secondary" onClick={onUndo} disabled={!canUndo}>
          撤销上一步
        </button>
        <button className="secondary" onClick={onReset}>
          重置实验
        </button>
      </div>
      <p role="status" className={feedback ? "feedback" : ""}>
        {feedback}
      </p>
      <Mentor />
    </section>
  );
}
function GitWorkspace() {
  const lab = useLab(gitLab);
  const [branch, setBranch] = useState("feature");
  const [message, setMessage] = useState("Add welcome");
  const s = lab.state;
  return (
    <Workspace
      title="Git 工作台"
      feedback={lab.feedback}
      onReset={lab.reset}
      onUndo={lab.undo}
      canUndo={lab.canUndo}
      onCheck={lab.check}
    >
      <p>
        目标：在非 main 分支提交包含 <code>Hello open source</code> 的
        README。这里不会执行真实 Git 或修改你的仓库。
      </p>
      <div className="card">
        <p>
          当前分支：<strong>{s.branch}</strong>
        </p>
        <label>
          新分支名称
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            maxLength={31}
          />
        </label>
        <button
          className="secondary"
          onClick={() => lab.dispatch({ type: "branch", name: branch })}
        >
          git switch -c
        </button>
        <label>
          工作区 README
          <textarea
            value={s.working}
            onChange={(e) =>
              lab.dispatch({ type: "edit", content: e.target.value })
            }
            maxLength={5000}
          />
        </label>
        <button
          className="secondary"
          onClick={() => lab.dispatch({ type: "stage" })}
        >
          git add README.md
        </button>
        <h3>暂存区快照</h3>
        <pre>{s.staged ?? "（空）"}</pre>
        <label>
          提交说明
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={120}
          />
        </label>
        <button
          className="secondary"
          onClick={() => lab.dispatch({ type: "commit", message })}
        >
          git commit
        </button>
        <p aria-live="polite">{s.message}</p>
      </div>
      <h2>提交历史</h2>
      {s.commits.length ? (
        <ol>
          {s.commits.map((c) => (
            <li key={c.id}>
              <strong>
                #{c.id} · {c.branch} · {c.message}
              </strong>
              <pre>{c.content}</pre>
            </li>
          ))}
        </ol>
      ) : (
        <p>尚无提交。修改 → 暂存 → 提交。</p>
      )}
    </Workspace>
  );
}
function LogicWorkspace() {
  const lab = useLab(logicLab);
  const s = lab.state;
  return (
    <Workspace
      title="逻辑门实验"
      feedback={lab.feedback}
      onReset={lab.reset}
      onUndo={lab.undo}
      canUndo={lab.canUndo}
      onCheck={lab.check}
    >
      <p>
        先切换输入观察输出，然后独立预测四行真值表。NOT 只使用 A，B
        对结果无影响。
      </p>
      <div className="card">
        <label>
          逻辑门
          <select
            value={s.gate}
            onChange={(e) =>
              lab.dispatch({
                type: "configure",
                gate: e.target.value as Gate,
                a: s.a,
                b: s.b,
              })
            }
          >
            {["AND", "OR", "XOR", "NOT"].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <div className="row">
          {(["a", "b"] as const).map((k) => (
            <button
              className="secondary"
              key={k}
              aria-pressed={s[k]}
              onClick={() =>
                lab.dispatch({
                  type: "configure",
                  gate: s.gate,
                  a: k === "a" ? !s.a : s.a,
                  b: k === "b" ? !s.b : s.b,
                })
              }
            >
              输入 {k.toUpperCase()}：{Number(s[k])}
            </button>
          ))}
        </div>
        <h2 aria-live="polite">输出：{Number(gateOutput(s.gate, s.a, s.b))}</h2>
      </div>
      <h2>挑战：预测真值表</h2>
      <table>
        <thead>
          <tr>
            <th>A</th>
            <th>B</th>
            <th>你的输出预测</th>
          </tr>
        </thead>
        <tbody>
          {s.predictions.map((p, i) => (
            <tr key={i}>
              <td>{Number(Boolean(i & 2))}</td>
              <td>{i % 2}</td>
              <td>
                <label>
                  <span className="sr-only">第 {i + 1} 行输出</span>
                  <select
                    value={p === null ? "" : Number(p)}
                    onChange={(e) =>
                      lab.dispatch({
                        type: "predict",
                        row: i,
                        value: e.target.value === "1",
                      })
                    }
                  >
                    <option value="" disabled>
                      请选择
                    </option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </select>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Workspace>
  );
}
export function LabRoute() {
  const { labId } = useParams();
  return labId === "python" ? (
    <Suspense fallback={<p role="status">正在加载 Python 课程…</p>}>
      <PythonLab />
    </Suspense>
  ) : labId === "spreadsheet" ? (
    <Suspense fallback={<p role="status">正在加载公式练习…</p>}>
      <Spreadsheet />
    </Suspense>
  ) : labId === "git" || !labId ? (
    <GitWorkspace />
  ) : labId === "logic" ? (
    <LogicWorkspace />
  ) : (
    <>
      <h1>实验不存在</h1>
      <Link to="/lab">返回实验室</Link>
    </>
  );
}
