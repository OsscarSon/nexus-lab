import {
  WorkspacePanels,
  PageIntro,
  Badge,
  ProgressBar,
} from "./components/ui";
import { Icon } from "./components/icon";
import { Mentor } from "./mentor";
import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { lessons } from "../../../content/opensource";
import {
  complete,
  parseProgress,
  grade,
} from "../../../packages/lesson-engine";
import { read, write } from "./storage";
export function getProgress() {
  const p = parseProgress(read("nexus-progress", null));
  return {
    ...p,
    completed: p.completed.filter((id) => lessons.some((l) => l.id === id)),
  };
}
export function Course() {
  const p = getProgress();
  return (
    <section className="course-overview prose">
      <Link className="back-link" to="/learn/opensource">
        ← 开源学院
      </Link>
      <PageIntro
        eyebrow="M01 · OPEN SOURCE LITERACY"
        title="读懂开源，从这里开始。"
      >
        6 节短课 · 约 30 分钟 · 无需账户 · 零基础
      </PageIntro>
      <div className="course-outcomes card">
        <Badge>课程可学习</Badge>
        <h2>理解权限、社区与可信的软件来源</h2>
        <p>
          按课学习，完成检查题，再用决策工作表展示你的判断。课时可自由回顾，不锁定线性进度。
        </p>
      </div>
      <ProgressBar
        label="课程完成进度"
        value={p.completed.length}
        total={lessons.length}
      />
      {lessons.map((l, i) => (
        <Link className="card choice" key={l.id} to={"/lesson/" + l.id}>
          <span>
            {p.completed.includes(l.id) ? "✓" : String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <strong>{l.title}</strong>
            <p>{l.summary}</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
      ))}
      <Link className="button" to="/learn/opensource/assessment">
        完成模块检查 →
      </Link>
    </section>
  );
}
export function Lesson() {
  const { lessonId } = useParams();
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson)
    return (
      <>
        <h1>课程不存在</h1>
        <Link to="/learn/opensource/foundations">返回课程</Link>
      </>
    );
  return <LessonBody key={lesson.id} lesson={lesson} />;
}
function LessonBody({ lesson: l }: { lesson: (typeof lessons)[number] }) {
  const [answer, setAnswer] = useState(-1);
  const [feedback, setFeedback] = useState("");
  const [passed, setPassed] = useState(false);
  const [hint, setHint] = useState(false);
  const [panel, setPanel] = useState("learn");
  const index = lessons.findIndex((x) => x.id === l.id);
  const next = lessons[index + 1];
  const p = getProgress();
  function check() {
    if (answer !== l.correct) {
      setFeedback("再想一想。" + l.hints[0]);
      setPassed(false);
    } else {
      const saved = write(
        "nexus-progress",
        complete(
          getProgress(),
          l.id,
          lessons.map((x) => x.id),
        ),
      );
      setPassed(true);
      setFeedback(
        l.explanation +
          (saved
            ? " 已保存学习进度。"
            : " 本题通过，但存储不可用，进度未保存。"),
      );
    }
    setPanel("result");
  }
  return (
    <div className="lesson-layout">
      <div className="outline">
        <details>
          <summary>课程目录 · 6 节</summary>
          {lessons.map((x, i) => (
            <NavLink key={x.id} to={"/lesson/" + x.id}>
              {p.completed.includes(x.id) ? "✓" : i + 1}. {x.title}
            </NavLink>
          ))}
        </details>
        <div className="outline-progress">
          <ProgressBar
            label="开源素养 M01"
            value={p.completed.length}
            total={lessons.length}
          />
          <p className="fine">按你的节奏，可以随时回顾。</p>
        </div>
      </div>
      <article className="lesson">
        <Link className="back-link" to="/learn/opensource/foundations">
          ← 课程概览
        </Link>
        <div className="row">
          <Badge>第 {index + 1} / 6 课</Badge>
          <span className="fine">
            {l.estimatedMinutes} 分钟 ·{" "}
            {p.completed.includes(l.id) ? "已完成，可回顾" : "尚未通过检查"}
          </span>
        </div>
        <h1>{l.title}</h1>
        <div className="lesson-goals">
          <Icon name="compass" size={20} />
          <p>学习目标：{l.objectives.join("；")}</p>
        </div>
        <WorkspacePanels
          active={panel}
          onSelect={setPanel}
          variant="lesson-panels"
          panels={[
            {
              id: "learn",
              label: "学习",
              children: (
                <>
                  <span className="eyebrow">UNDERSTAND THE IDEA</span>
                  {l.segments.map((seg) => (
                    <section key={seg.heading}>
                      <h2>{seg.heading}</h2>
                      <p>{seg.body}</p>
                    </section>
                  ))}
                  <div className="example-card">
                    <span className="eyebrow">GUIDED EXAMPLE</span>
                    <p>{l.example}</p>
                  </div>
                  {l.id === "os-source" && <RepositoryDemo />}
                  <button
                    className="secondary mobile-panel-action"
                    onClick={() => setPanel("practice")}
                  >
                    进入练习
                    <Icon name="arrow" size={18} />
                  </button>
                </>
              ),
            },
            {
              id: "practice",
              label: "练习",
              children: (
                <>
                  <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
                  <fieldset className="answers">
                    <legend>{l.question}</legend>
                    {l.options.map((o, i) => (
                      <label key={o}>
                        <input
                          type="radio"
                          name="answer"
                          checked={answer === i}
                          onChange={() => {
                            setAnswer(i);
                            setFeedback("");
                            setPassed(false);
                          }}
                        />
                        {o}
                      </label>
                    ))}
                    <div className="practice-actions">
                      <button disabled={answer < 0} onClick={check}>
                        <Icon name="check" size={18} />
                        检查答案
                      </button>
                      <button
                        className="secondary"
                        onClick={() => setHint(!hint)}
                      >
                        {hint ? "收起提示" : "给我一个提示"}
                      </button>
                    </div>
                    {hint && <p className="hint-text">{l.hints[0]}</p>}
                  </fieldset>
                </>
              ),
            },
            {
              id: "result",
              label: "结果",
              children: (
                <>
                  <span className="eyebrow">REFLECT & CONTINUE</span>
                  <h2>{passed ? "理解，又向前了一步。" : "看看你的理解"}</h2>
                  {feedback ? (
                    <p role="status" className="feedback">
                      {feedback}
                    </p>
                  ) : (
                    <p className="fine">
                      完成检查后，这里会显示具体反馈。回答错误也可以继续尝试。
                    </p>
                  )}
                  {passed && (
                    <Link
                      className="button"
                      to={
                        next
                          ? "/lesson/" + next.id
                          : "/learn/opensource/assessment"
                      }
                    >
                      {next ? "下一课 →" : "进入模块检查 →"}
                    </Link>
                  )}
                  {feedback && !passed && (
                    <button
                      className="secondary mobile-panel-action"
                      onClick={() => setPanel("practice")}
                    >
                      返回练习
                    </button>
                  )}
                </>
              ),
            },
          ]}
        />
        <Mentor lessonId={l.id} />
        <details className="lesson-references">
          <summary>参考与内容说明</summary>
          <p>原创教学内容，版本 {l.version}。尚未经过外部专家审核。</p>
          {l.references.map((r) => (
            <p key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.title} ↗
              </a>
            </p>
          ))}
        </details>
      </article>
    </div>
  );
}
function RepositoryDemo() {
  const [file, setFile] = useState("README.md");
  const files: Record<string, string> = {
    "README.md": "# Hello Project\n使用说明：运行 hello.py，显示欢迎信息。",
    "hello.py": 'print("你好，开源世界")',
    LICENSE: "示例许可证占位说明：真实项目需要检查完整的授权条款。",
  };
  return (
    <div className="card">
      <h3>仓库探索 · 离线教学示例</h3>
      <p>点击文件，区分使用说明、源代码与许可。</p>
      <div className="row">
        {Object.keys(files).map((f) => (
          <button
            className="secondary"
            key={f}
            onClick={() => setFile(f)}
            aria-pressed={file === f}
          >
            {f}
          </button>
        ))}
      </div>
      <pre>{files[file]}</pre>
      <p>此示例不连接 GitHub，也不运行代码。</p>
    </div>
  );
}
export function Assessment() {
  const [answers, setAnswers] = useState([-1, -1, -1]);
  const [message, setMessage] = useState("");
  const scenarios = [
    { title: "项目 A：MIT，允许使用、修改和分发，须保留声明。", correct: 0 },
    { title: "项目 B：源码可见，但禁止商业使用。", correct: 1 },
    { title: "项目 C：公开可见，没有任何许可条款。", correct: 2 },
  ];
  return (
    <section className="prose">
      <Link to="/learn/opensource/foundations">← 课程概览</Link>
      <h1>开源决策工作表</h1>
      <p>
        使用实际权限条款分类，不依靠价格、星标或仓库是否公开。没有完成所有课程也可以练习。
      </p>
      {scenarios.map((s, i) => (
        <fieldset key={s.title} className="card answers">
          <legend>{s.title}</legend>
          {["开源许可", "源码可见，有用途限制", "授权不明确，先确认"].map(
            (o, j) => (
              <label key={o}>
                <input
                  type="radio"
                  name={"scenario" + i}
                  checked={answers[i] === j}
                  onChange={() => {
                    setAnswers(answers.map((a, k) => (k === i ? j : a)));
                    setMessage("");
                  }}
                />
                {o}
              </label>
            ),
          )}
        </fieldset>
      ))}
      <button
        disabled={answers.includes(-1)}
        onClick={() => {
          const passed = grade(
            answers,
            scenarios.map((s) => s.correct),
          );
          if (passed) {
            const saved = write("nexus-worksheet", {
              version: 1,
              answers,
              completedAt: new Date().toISOString(),
            });
            setMessage(
              "全部正确。MIT 仍需遵守声明义务；限制商业使用不符合开源定义；缺少许可需先确认。" +
                (saved ? "工作表已保存在本机。" : "存储不可用，未保存。"),
            );
          } else
            setMessage(
              "还有需要检查的分类：用途限制与没有授权，都不能视为开放许可。请重读第二课。",
            );
        }}
      >
        检查工作表
      </button>
      <p role="status">{message}</p>
      <Link to="/projects">查看学习成果 →</Link>
    </section>
  );
}
