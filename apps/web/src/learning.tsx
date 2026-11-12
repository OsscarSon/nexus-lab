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
export function ContinueLearning() {
  const p = getProgress();
  const next = lessons.find((l) => !p.completed.includes(l.id));
  return (
    <>
      <p>
        {p.completed.length
          ? `已完成 ${p.completed.length} / ${lessons.length} 节 · 记录仅保存在此设备`
          : "还没有学习记录。用 5 分钟认识开源世界。"}
      </p>
      <Link
        className="button"
        to={next ? "/lesson/" + next.id : "/learn/opensource/foundations"}
      >
        {next ? `开始 · ${next.title}` : "回顾课程与成果"} ↗
      </Link>
    </>
  );
}
export function Course() {
  const p = getProgress();
  return (
    <section className="prose">
      <Link to="/learn/opensource">← 开源学院</Link>
      <p className="eyebrow">M01 · OPEN SOURCE LITERACY</p>
      <h1>读懂开源，从这里开始。</h1>
      <p>6 节短课 · 约 30 分钟 · 无需账户 · 零基础</p>
      <div className="progress" aria-label={`已完成 ${p.completed.length} / 6`}>
        <span
          style={{ width: (100 * p.completed.length) / lessons.length + "%" }}
        />
      </div>
      <p>{p.completed.length} / 6 节已完成</p>
      {lessons.map((l, i) => (
        <Link className="card choice" key={l.id} to={"/lesson/" + l.id}>
          <span>
            {p.completed.includes(l.id) ? "✓" : String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <strong>{l.title}</strong>
            <p>{l.summary}</p>
          </div>
          <span>→</span>
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
  const next = lessons[lessons.findIndex((x) => x.id === l.id) + 1];
  return (
    <div className="lesson-layout">
      <div className="outline" aria-label="课程目录">
        {lessons.map((x, i) => (
          <NavLink key={x.id} to={"/lesson/" + x.id}>
            {i + 1}. {x.title}
          </NavLink>
        ))}
      </div>
      <article className="lesson">
        <Link to="/learn/opensource/foundations">← 课程概览</Link>
        <p className="eyebrow">M01 · {l.estimatedMinutes} MIN</p>
        <h1>{l.title}</h1>
        <p>学习目标：{l.objectives.join("；")}</p>
        {l.segments.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            <p>{s.body}</p>
          </section>
        ))}
        <div className="card">
          <span className="eyebrow">GUIDED EXAMPLE</span>
          <p>{l.example}</p>
        </div>
        {l.id === "os-source" && <RepositoryDemo />}
        <fieldset className="card answers">
          <legend>试一试 · {l.question}</legend>
          {l.options.map((o, i) => (
            <label key={o}>
              <input
                type="radio"
                name="answer"
                checked={answer === i}
                onChange={() => {
                  setAnswer(i);
                  setFeedback("");
                }}
              />
              {o}
            </label>
          ))}
          <div className="row">
            <button
              disabled={answer < 0}
              onClick={() => {
                if (answer !== l.correct) {
                  setFeedback("再想一想。" + l.hints[0]);
                  return;
                }
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
              }}
            >
              检查答案
            </button>
            <button className="secondary" onClick={() => setHint(!hint)}>
              {hint ? "收起提示" : "给我一个提示"}
            </button>
          </div>
          {hint && <p>{l.hints[0]}</p>}
          <p role="status" className={feedback ? "feedback" : ""}>
            {feedback}
          </p>
        </fieldset>
        {passed && (
          <Link
            className="button"
            to={next ? "/lesson/" + next.id : "/learn/opensource/assessment"}
          >
            {next ? "下一课 →" : "进入模块检查 →"}
          </Link>
        )}
        <details>
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
