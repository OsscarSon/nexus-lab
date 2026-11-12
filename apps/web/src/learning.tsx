import { useEffect, useState } from "react";
import { Link, NavLink, useParams, useSearchParams } from "react-router-dom";
import {
  WorkspacePanels,
  PageIntro,
  Badge,
  ProgressBar,
} from "./components/ui";
import { Icon } from "./components/icon";
import { Mentor } from "./mentor";
import { curriculum } from "../../../content/curriculum";
import {
  ref,
  type Lesson as LessonContent,
} from "../../../packages/curriculum/schema";
import { grade } from "../../../packages/lesson-engine";
import {
  completedKeys,
  courseProgress,
  gradeLesson,
} from "../../../packages/curriculum/evidence";
import { write } from "./storage";
import {
  readCurriculumProgress,
  saveEvidence,
  migrateLearningData,
  compatibleProgress,
} from "./curriculum-storage";
import { InteractiveBlock } from "./interactions";
export function getProgress() {
  return compatibleProgress();
}
export function Course() {
  const { courseId } = useParams();
  const course = curriculum.get(
    "course",
    courseId || "course.opensource-literacy",
  );
  if (!course || course.status !== "available")
    return (
      <>
        <h1>课程尚未开放或不存在</h1>
        <Link to="/learn">查看已发布课程</Link>
      </>
    );
  const ledger = readCurriculumProgress();
  const lessons = curriculum.lessons(ref("course", course.id));
  const progress = courseProgress(ref("course", course.id), ledger, curriculum);
  const checkpoints = curriculum
    .requirements(ref("course", course.id))
    .filter((r) => r.kind === "assessment")
    .map((r) => curriculum.get("assessment", r.id)!);
  const academy = curriculum
    .list("path")
    .find((p) => p.courseRefs.some((c) => c.id === course.id))?.academyRefs[0];
  return (
    <section className="course-overview prose">
      <Link
        className="back-link"
        to={academy ? "/learn/" + academy.id : "/learn"}
      >
        ← {academy ? curriculum.get("academy", academy.id)?.title : "学院目录"}
      </Link>
      <PageIntro
        eyebrow="SHARED CURRICULUM · V1"
        title={
          course.id === "course.opensource-literacy"
            ? "读懂开源，从这里开始。"
            : course.title
        }
      >
        {course.description}
      </PageIntro>
      <div className="course-outcomes card">
        <Badge>课程可学习</Badge>
        <h2>这一次，你会学到</h2>
        <ul className="objectives">
          {course.outcomes.map((o) => (
            <li key={o}>
              <Icon name="check" size={18} />
              {o}
            </li>
          ))}
        </ul>
        <p className="fine">
          共享课时通过一次即可抵扣兼容路径；不同项目的独立要求分别验证。
        </p>
      </div>
      <ProgressBar
        label="课程完成进度"
        value={progress.completed}
        total={progress.total}
      />
      {lessons.map((lesson, i) => (
        <Link
          className="card choice"
          key={lesson.id}
          to={"/lesson/" + lesson.id + "?course=" + course.id}
        >
          <span>
            {ledger.evidence.some(
              (e) =>
                e.kind === "lesson" &&
                e.id === lesson.id &&
                e.version === lesson.version,
            )
              ? "✓"
              : String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <strong>{lesson.title}</strong>
            <p>{lesson.summary}</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
      ))}
      {checkpoints.length > 0 && (
        <section className="card">
          <h2>模块测评</h2>
          {checkpoints.map((a) => (
            <Link
              className="text-link"
              key={a.id}
              to={"/assessment/" + a.id + "?course=" + course.id}
            >
              {a.title} →
            </Link>
          ))}
        </section>
      )}
      {course.id === "course.opensource-literacy" && (
        <Link className="button" to="/learn/opensource/assessment">
          完成模块检查 →
        </Link>
      )}
      {course.projectRefs.length > 0 && (
        <details>
          <summary>本课程作品要求</summary>
          {course.projectRefs.map((r) => (
            <p key={r.id}>{curriculum.get("project", r.id)?.description}</p>
          ))}
          <Link className="text-link" to="/projects">
            查看已有作品与证据 →
          </Link>
        </details>
      )}
    </section>
  );
}
export function Lesson() {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const lesson = curriculum.get("lesson", lessonId || "");
  const requested = params.get("course");
  const course =
    (requested && curriculum.get("course", requested)) ||
    curriculum
      .list("course")
      .find(
        (c) =>
          c.status === "available" &&
          curriculum
            .lessons(ref("course", c.id))
            .some((l) => l.id === lessonId),
      );
  if (!lesson || lesson.status !== "available")
    return (
      <>
        <h1>课程不存在</h1>
        <Link to="/learn">返回课程目录</Link>
      </>
    );
  const context =
    course &&
    course.status === "available" &&
    curriculum.lessons(ref("course", course.id)).some((l) => l.id === lesson.id)
      ? course
      : undefined;
  return (
    <LessonBody
      key={lesson.id + "-" + context?.id}
      lesson={lesson}
      courseId={context?.id}
    />
  );
}
function LessonBody({
  lesson: l,
  courseId,
}: {
  lesson: LessonContent;
  courseId?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [exercises, setExercises] = useState<Record<string, unknown>>({});
  const [feedback, setFeedback] = useState("");
  const [passed, setPassed] = useState(false);
  const [hint, setHint] = useState(false);
  const [panel, setPanel] = useState("learn");
  const [storageWarning, setStorageWarning] = useState("");
  useEffect(() => {
    if (!migrateLearningData())
      setStorageWarning(
        "当前存储不可用，旧记录保持原样，本次学习可能无法保存。",
      );
  }, []);
  const ledger = readCurriculumProgress();
  const p = getProgress();
  const course = courseId && curriculum.get("course", courseId);
  const lessons = course ? curriculum.lessons(ref("course", course.id)) : [l];
  const index = lessons.findIndex((x) => x.id === l.id);
  const next =
    lessons[index + 1] ||
    l.nextRefs
      .map((r) =>
        r.kind === "lesson" ? curriculum.get("lesson", r.id) : undefined,
      )
      .find((x) => x?.status === "available");
  const prerequisites = curriculum.prerequisites(
    ref("lesson", l.id),
    completedKeys(ledger, curriculum),
  );
  const blocked = prerequisites.some(
    (d) => d.kind === "required" && !d.satisfied,
  );
  const assessments = l.assessmentRefs.map(
    (r) => curriculum.get("assessment", r.id)!,
  );
  const legacy = l.legacyCompatible;
  function check() {
    if (blocked) {
      setFeedback("先完成列出的必需先修，再保存本课证据。");
      setPassed(false);
    } else if (!gradeLesson(l, { exercise: exercises, answers }, curriculum)) {
      setFeedback(
        "再想一想。" +
          l.hints[0] +
          (l.requiresExercise ? " 请先通过互动练习，再完成检查题。" : ""),
      );
      setPassed(false);
    } else {
      const saved = saveEvidence({
        kind: "lesson",
        id: l.id,
        version: l.version,
        completedAt: new Date().toISOString(),
        source: "assessment",
        proof: { exercise: exercises, answers },
      });
      setPassed(true);
      setFeedback(
        assessments.map((a) => a.explanation).join(" ") +
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
          <summary>课程目录 · {lessons.length} 节</summary>
          {lessons.map((x, i) => (
            <NavLink
              key={x.id}
              to={"/lesson/" + x.id + (courseId ? "?course=" + courseId : "")}
            >
              {p.completed.includes(x.id) ? "✓" : i + 1}. {x.title}
            </NavLink>
          ))}
        </details>
        {course && (
          <div className="outline-progress">
            <ProgressBar
              label={course.title}
              value={
                courseProgress(ref("course", course.id), ledger, curriculum)
                  .completed
              }
              total={lessons.length}
            />
            <p className="fine">同一课时在其他路径也可复用。</p>
          </div>
        )}
      </div>
      <article className="lesson">
        <Link
          className="back-link"
          to={
            course
              ? course.id === "course.opensource-literacy"
                ? "/learn/opensource/foundations"
                : "/course/" + course.id
              : "/learn"
          }
        >
          ← 课程概览
        </Link>
        <div className="row">
          <Badge>
            第 {index + 1} / {lessons.length} 课
          </Badge>
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
        {storageWarning && <p role="alert">{storageWarning}</p>}
        {prerequisites.length > 0 && (
          <details>
            <summary>先修与相关主题</summary>
            {prerequisites.map((d) => (
              <p key={d.kind + d.to.id}>
                {d.kind === "required"
                  ? "必需"
                  : d.kind === "recommended"
                    ? "建议"
                    : "相关"}
                ：{d.title} · {d.rationale} ·{" "}
                {d.satisfied ? "已有兼容证据" : "尚未完成"}
                {d.to.kind === "lesson" && (
                  <Link className="text-link" to={"/lesson/" + d.to.id}>
                    查看先修课时 →
                  </Link>
                )}
              </p>
            ))}
          </details>
        )}
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
                  {l.segments.map((s) => (
                    <section key={s.heading}>
                      <h2>{s.heading}</h2>
                      <p>{s.body}</p>
                    </section>
                  ))}
                  <div className="example-card">
                    <span className="eyebrow">GUIDED EXAMPLE</span>
                    <p>{l.example}</p>
                  </div>
                  {l.blocks
                    .filter((b) => b.kind === "repository")
                    .map((b) => (
                      <InteractiveBlock
                        block={b}
                        key={b.id}
                        onEvidence={() => undefined}
                      />
                    ))}
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
                  <span className="eyebrow">TRY & CHECK</span>
                  {l.blocks
                    .filter((b) => b.kind !== "repository")
                    .map((b) => (
                      <InteractiveBlock
                        key={b.id}
                        block={b}
                        onEvidence={(value) => {
                          setExercises((previous) => ({
                            ...previous,
                            [b.id]: value,
                          }));
                          setFeedback("");
                          setPassed(false);
                        }}
                      />
                    ))}
                  {assessments.map((a) => (
                    <fieldset className="answers" key={a.id}>
                      <legend>{a.question}</legend>
                      {a.options.map((o, i) => (
                        <label key={o}>
                          <input
                            type="radio"
                            name={a.id}
                            checked={answers[a.id] === i}
                            onChange={() => {
                              setAnswers({ ...answers, [a.id]: i });
                              setFeedback("");
                              setPassed(false);
                            }}
                          />
                          {o}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                  <div className="practice-actions">
                    <button
                      disabled={assessments.some(
                        (a) => answers[a.id] === undefined,
                      )}
                      onClick={check}
                    >
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
                  {passed &&
                    (next ? (
                      <Link
                        className="button"
                        to={
                          "/lesson/" +
                          next.id +
                          (courseId && lessons.some((x) => x.id === next.id)
                            ? "?course=" + courseId
                            : "")
                        }
                      >
                        下一课 →
                      </Link>
                    ) : legacy ? (
                      <Link
                        className="button"
                        to="/learn/opensource/assessment"
                      >
                        进入模块检查 →
                      </Link>
                    ) : (
                      <Link
                        className="button"
                        to={course ? "/course/" + course.id : "/learn"}
                      >
                        返回课程与成果 →
                      </Link>
                    ))}
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

export function GenericAssessment() {
  const { assessmentId } = useParams();
  const [params] = useSearchParams();
  const assessment = curriculum.get("assessment", assessmentId || "");
  const [answer, setAnswer] = useState(-1);
  const [feedback, setFeedback] = useState("");
  if (!assessment || assessment.status !== "available")
    return (
      <>
        <h1>测评尚未开放</h1>
        <Link to="/learn">返回课程</Link>
      </>
    );
  const course = params.get("course");
  return (
    <section className="prose">
      <PageIntro eyebrow="CHECK YOUR UNDERSTANDING" title={assessment.title}>
        完成自动检查，保存一份独立的测评证据。
      </PageIntro>
      <fieldset className="card answers">
        <legend>{assessment.question}</legend>
        {assessment.options.map((option, i) => (
          <label key={option}>
            <input
              type="radio"
              name="assessment"
              checked={answer === i}
              onChange={() => {
                setAnswer(i);
                setFeedback("");
              }}
            />
            {option}
          </label>
        ))}
      </fieldset>
      <button
        disabled={answer < 0}
        onClick={() => {
          if (answer !== assessment.correct) {
            setFeedback("再想一想，尚未通过测评。");
            return;
          }
          const saved = saveEvidence({
            kind: "assessment",
            id: assessment.id,
            version: assessment.version,
            source: "assessment",
            completedAt: new Date().toISOString(),
            proof: { answer },
          });
          setFeedback(
            assessment.explanation +
              (saved ? " 已保存测评证据。" : " 存储不可用，未保存。"),
          );
        }}
      >
        检查测评
      </button>
      <p role="status">{feedback}</p>
      <Link
        className="text-link"
        to={
          course && curriculum.get("course", course)
            ? "/course/" + course
            : "/learn"
        }
      >
        返回课程 →
      </Link>
    </section>
  );
}
