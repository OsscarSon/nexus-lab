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
import { labCatalog } from "../../../content/experience";
import { write } from "./storage";
import { Icon } from "./components/icon";
import { PageIntro, Badge, WorkspacePanels } from "./components/ui";
const PythonLab = lazy(() => import("./python"));
const Spreadsheet = lazy(() => import("./spreadsheet"));
export function LabDirectory() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("available");
  const planned = [
    {
      id: "ai",
      title: "AI 实验",
      description: "提示设计与输出评估实验。",
      kind: "规划中",
    },
    {
      id: "games",
      title: "游戏实验",
      description: "规则、互动与关卡原型。",
      kind: "规划中",
    },
    {
      id: "robotics",
      title: "硬件与机器人实验",
      description: "传感、控制与设备能力探索。",
      kind: "规划中",
    },
    {
      id: "security",
      title: "网络与安全实验",
      description: "在授权环境认识协议与权限。",
      kind: "规划中",
    },
    {
      id: "workspace",
      title: "自动化流程实验",
      description: "可解释、可验证的工作流程。",
      kind: "规划中",
    },
  ];
  const items = [
    ...labCatalog.map((l) => ({ ...l, available: true })),
    ...planned.map((l) => ({ ...l, available: false })),
  ].filter(
    (l) =>
      (l.title + l.id + l.description)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || l.available),
  );
  return (
    <>
      <PageIntro
        eyebrow="LEARN THROUGH EXPERIMENT"
        title="把想法，变成亲手的发现。"
      >
        每个实验都是一次小探索。模拟与真实执行清楚区分，检查结果真实可见。
      </PageIntro>
      <div className="catalog-toolbar">
        <label className="search search-box">
          <span className="sr-only">搜索实验</span>
          <Icon name="search" size={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 Git、Python、逻辑门…"
          />
        </label>
        <div className="filter-group" aria-label="实验状态">
          <button
            className="filter-button"
            aria-pressed={filter === "available"}
            onClick={() => setFilter("available")}
          >
            已开放
          </button>
          <button
            className="filter-button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            含未来实验
          </button>
        </div>
        <span className="result-count">{items.length} 个实验</span>
      </div>
      <div className="grid lab-grid">
        {items.map((l) => {
          const content = (
            <>
              <div className="card-top">
                <span className="academy-icon">
                  <Icon name={l.id} size={26} />
                </span>
                <Badge muted={!l.available}>{l.kind}</Badge>
              </div>
              <h2>{l.title}</h2>
              <p>{l.description}</p>
              <div className="lab-card-bottom">
                <span>
                  {l.available ? "初学者 · 浏览器即可练习" : "尚未开放"}
                </span>
                {l.available && <Icon name="arrow" size={18} />}
              </div>
            </>
          );
          return l.available ? (
            <Link className="card lab-card" to={"/lab/" + l.id} key={l.id}>
              {content}
            </Link>
          ) : (
            <article className="card lab-card planned-lab" key={l.id}>
              {content}
            </article>
          );
        })}
      </div>
      {!items.length && (
        <p role="status" className="card">
          没有匹配的实验，试试其他关键词。
        </p>
      )}
      <p className="fine">
        实验由平台共享，不属于某个学院的专属入口。尚未开放的实验不提供虚假操作。
      </p>
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
  instructions,
  children,
  result,
  feedback,
  onReset,
  onUndo,
  canUndo,
  onCheck,
}: {
  title: string;
  instructions: ReactNode;
  children: ReactNode;
  result: ReactNode;
  feedback: string;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onCheck: () => void;
}) {
  const [panel, setPanel] = useState("work");
  return (
    <div className="lab-workspace">
      <Link className="back-link" to="/lab">
        ← 所有实验
      </Link>
      <PageIntro eyebrow="NEXUS LAB · INTERACTIVE WORKSPACE" title={title}>
        先观察，再尝试。每个结果，都可以亲手验证。
      </PageIntro>
      <div className="workspace-meta">
        <Badge>教学模拟</Badge>
        <span>
          <Icon name="clock" size={14} />
          按自己的节奏
        </span>
        <span>通过检查后保存本机证据</span>
      </div>
      <WorkspacePanels
        active={panel}
        onSelect={setPanel}
        variant="lab-panels"
        panels={[
          {
            id: "guide",
            label: "任务说明",
            children: (
              <div className="task-brief">
                <span className="eyebrow">YOUR CHALLENGE</span>
                <h2>今天的小任务</h2>
                {instructions}
              </div>
            ),
          },
          {
            id: "work",
            label: "操作区",
            children: <div className="workspace-editor">{children}</div>,
          },
          {
            id: "result",
            label: "结果",
            children: (
              <div className="workspace-output">
                <span className="eyebrow">OBSERVE & VERIFY</span>
                {result}
              </div>
            ),
          },
        ]}
      />
      <div className="workspace-actions">
        <button
          onClick={() => {
            onCheck();
            setPanel("result");
          }}
        >
          <Icon name="check" size={18} />
          检查挑战
        </button>
        <div className="row">
          <button className="secondary" onClick={onUndo} disabled={!canUndo}>
            撤销上一步
          </button>
          <button
            className="secondary"
            onClick={() => {
              onReset();
              setPanel("work");
            }}
          >
            重置实验
          </button>
        </div>
      </div>
      <p role="status" className={feedback ? "feedback" : ""}>
        {feedback}
      </p>
      <Mentor />
    </div>
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
      instructions={
        <>
          <p>
            在非 main 分支提交包含 <code>Hello open source</code> 的
            README。这里不会执行真实 Git 或修改你的仓库。
          </p>
          <details>
            <summary>需要一点提示？</summary>
            <p>
              创建分支 → 修改工作区 → 暂存当前快照 →
              写提交说明并提交。暂存后再次修改，不会自动改变已暂存的内容。
            </p>
          </details>
        </>
      }
      feedback={lab.feedback}
      onReset={lab.reset}
      onUndo={lab.undo}
      canUndo={lab.canUndo}
      onCheck={lab.check}
      result={
        <>
          <h2>提交历史</h2>
          <p className="fine">
            当前分支：{s.branch} · {s.commits.length} 次模拟提交
          </p>
          {s.commits.length ? (
            <ol className="commit-history">
              {s.commits.map((c) => (
                <li key={c.id}>
                  <span className="commit-dot" />
                  <strong>
                    #{c.id} · {c.branch}
                  </strong>
                  <p>{c.message}</p>
                  <pre>{c.content}</pre>
                </li>
              ))}
            </ol>
          ) : (
            <div className="output-empty">
              <Icon name="git" size={36} />
              <p>尚无提交。修改 → 暂存 → 提交。</p>
            </div>
          )}
        </>
      }
    >
      <section className="editor-step">
        <span className="step-number">01</span>
        <h2>创建你的分支</h2>
        <p className="fine">
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
      </section>
      <section className="editor-step">
        <span className="step-number">02</span>
        <h2>修改并暂存</h2>
        <label>
          工作区 README
          <textarea
            className="code-input"
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
        <details className="staged-preview">
          <summary>
            查看暂存区快照{s.staged !== null ? " · 已暂存" : " · 空"}
          </summary>
          <pre>{s.staged ?? "（空）"}</pre>
        </details>
      </section>
      <section className="editor-step">
        <span className="step-number">03</span>
        <h2>保存一次提交</h2>
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
        <p aria-live="polite" className="editor-note">
          {s.message}
        </p>
      </section>
    </Workspace>
  );
}
function LogicWorkspace() {
  const lab = useLab(logicLab);
  const s = lab.state;
  return (
    <Workspace
      title="逻辑门实验"
      instructions={
        <>
          <p>
            先切换输入观察输出，然后独立预测四行真值表。NOT 只使用 A，B
            对结果无影响。
          </p>
          <details>
            <summary>逻辑门速查</summary>
            <p>
              AND：两者为 1。OR：至少一个为 1。XOR：只有一个为 1。NOT：反转 A。
            </p>
          </details>
        </>
      }
      feedback={lab.feedback}
      onReset={lab.reset}
      onUndo={lab.undo}
      canUndo={lab.canUndo}
      onCheck={lab.check}
      result={
        <>
          <h2>挑战：预测真值表</h2>
          <p className="fine">为 {s.gate} 的每组输入预测输出，再检查挑战。</p>
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
        </>
      }
    >
      <h2>观察一个逻辑门</h2>
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
      <div className="gate-stage">
        <div className="gate-inputs">
          {(["a", "b"] as const).map((k) => (
            <button
              className={"gate-switch" + (s[k] ? " on" : "")}
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
        <div className="gate-symbol">
          <Icon name="logic" size={48} />
          <strong>{s.gate}</strong>
        </div>
        <div
          className={"gate-light" + (gateOutput(s.gate, s.a, s.b) ? " on" : "")}
        >
          <span />
          <h2 aria-live="polite">
            输出：{Number(gateOutput(s.gate, s.a, s.b))}
          </h2>
        </div>
      </div>
      <p className="fine">
        输入开关会立即更新真实布尔运算结果。到“结果”面板完成独立预测。
      </p>
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
