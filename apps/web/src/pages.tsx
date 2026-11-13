import { qualityLabel } from "../../../packages/curriculum/quality";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { academies } from "../../../content/catalog";
import {
  academyPlans,
  academyCourses,
  academyAvailability,
  labCatalog,
  levelLabels,
  publicationLabels,
  type CourseEntry,
} from "../../../content/experience";
import { curriculum } from "../../../content/curriculum";
import { ref } from "../../../packages/curriculum/schema";
import { courseProgress } from "../../../packages/curriculum/evidence";
import { readCurriculumProgress } from "./curriculum-storage";
import { read, write } from "./storage";
import {
  readLearning,
  readVisits,
  readArtifacts,
  exportArtifact,
  type Artifact,
} from "./activity";
import { Icon } from "./components/icon";
import {
  PageIntro,
  SectionTitle,
  Badge,
  ProgressBar,
  EmptyState,
} from "./components/ui";
export function AcademyCard({
  academy: a,
}: {
  academy: (typeof academies)[number];
}) {
  const available = academyCourses(a.id).some((c) => c.status === "available");
  return (
    <Link className="card academy" to={"/learn/" + a.id}>
      <div className="card-top">
        <span className="academy-icon">
          <Icon name={a.id} size={26} />
        </span>
        <Icon name="arrow" size={18} />
      </div>
      <span className="eyebrow">{a.english}</span>
      <h3>{a.title}</h3>
      <p>{a.description}</p>
      <span className="card-meta">
        <Badge muted={!available}>{academyAvailability(a.id)}</Badge>
      </span>
    </Link>
  );
}
export function Welcome() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <PageIntro eyebrow="A LITTLE ABOUT YOU" title="今天，想探索什么？">
        十个方向，同样值得探索。选一个感兴趣的起点，之后随时可以改变。
      </PageIntro>
      <fieldset className="goal-fieldset">
        <legend className="sr-only">选择学习方向</legend>
        <div className="goal-grid">
          {academies.map((a) => (
            <label
              className={"goal-option" + (goal === a.id ? " selected" : "")}
              key={a.id}
            >
              <input
                type="radio"
                name="goal"
                checked={goal === a.id}
                onChange={() => setGoal(a.id)}
              />
              <span className="academy-icon">
                <Icon name={a.id} />
              </span>
              <span>
                <strong>{a.title}</strong>
                <small>{a.english}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="onboarding-actions">
        <button
          disabled={!goal}
          onClick={() => {
            if (write("nexus-goal", goal)) navigate("/learn/" + goal);
            else setError("浏览器无法保存偏好，仍可跳过并继续。");
          }}
        >
          开始探索
          <Icon name="arrow" size={18} />
        </button>
        <Link className="button secondary" to="/learn">
          自由探索
        </Link>
        <Link className="text-link" to="/home">
          暂时跳过
        </Link>
      </div>
      <p role="status">{error}</p>
      <p className="fine">
        不用注册，也不需要 API key。学习偏好只保存在此设备。
      </p>
    </>
  );
}
function RecentArtifact({ artifact: a }: { artifact: Artifact }) {
  return (
    <Link className="recent-row" to={"/projects/" + a.id}>
      <span className="small-icon">
        <Icon name="projects" />
      </span>
      <span>
        <strong>{a.title}</strong>
        <small>已通过检查 · 本机成果</small>
      </span>
      <Icon name="arrow" size={18} />
    </Link>
  );
}
export function Home() {
  const goal = academies.find((a) => a.id === read("nexus-goal", ""));
  const progress = readLearning();
  const visits = readVisits();
  const artifacts = readArtifacts();
  const recent = visits.find((v) => v.kind === "lesson" || v.kind === "lab");
  const lastLesson = curriculum.get("lesson", progress.lastLesson || "");
  const recentLesson =
    recent?.kind === "lesson"
      ? recent.path.split("?")[0].split("/").pop()
      : lastLesson?.id;
  const contextId =
    recent?.kind === "lesson"
      ? new URLSearchParams(recent.path.split("?")[1] || "").get("course")
      : undefined;
  const activeCourse =
    (contextId && curriculum.get("course", contextId)) ||
    (goal &&
    curriculum.get("course", "course." + goal.id + "-starter") &&
    curriculum
      .lessons(ref("course", "course." + goal.id + "-starter"))
      .some((l) => l.id === recentLesson)
      ? curriculum.get("course", "course." + goal.id + "-starter")
      : undefined) ||
    curriculum
      .list("course")
      .find(
        (c) =>
          c.status === "available" &&
          curriculum
            .lessons(ref("course", c.id))
            .some(
              (l) =>
                l.id === recentLesson ||
                (!recentLesson && progress.completed.includes(l.id)),
            ),
      );
  const lessons = activeCourse
    ? curriculum.lessons(ref("course", activeCourse.id))
    : [];
  const nextLesson = lessons.find((l) => !progress.completed.includes(l.id));
  const courseCompleted = lessons.filter((l) =>
    progress.completed.includes(l.id),
  ).length;
  const courseUrl = activeCourse
    ? activeCourse.id === "course.opensource-literacy"
      ? "/learn/opensource/foundations"
      : "/course/" + activeCourse.id
    : "/learn";
  const hasLearning = Boolean(
    recent || progress.completed.length || artifacts.length,
  );
  const resume = recent
    ? recent.kind === "lesson" &&
      progress.completed.includes(
        recent.path.split("?")[0].split("/").pop() || "",
      )
      ? {
          title: nextLesson?.title || activeCourse?.title || "课程回顾",
          path: nextLesson
            ? "/lesson/" +
              nextLesson.id +
              (activeCourse ? "?course=" + activeCourse.id : "")
            : courseUrl,
        }
      : { title: recent.title, path: recent.path }
    : lastLesson || progress.completed.length
      ? {
          title: nextLesson?.title || activeCourse?.title || "课程回顾",
          path: nextLesson
            ? "/lesson/" +
              nextLesson.id +
              (activeCourse ? "?course=" + activeCourse.id : "")
            : courseUrl,
        }
      : artifacts[0]
        ? { title: artifacts[0].title, path: artifacts[0].source }
        : undefined;
  const recentLabs = visits.filter((v) => v.kind === "lab").slice(0, 3);
  const projectVisits = visits.filter((v) => v.kind === "project");
  const viewedArtifacts = projectVisits
    .map((v) => artifacts.find((a) => v.path === "/projects/" + a.id))
    .filter((a): a is Artifact => Boolean(a));
  const recentProjects = [
    ...viewedArtifacts,
    ...artifacts.filter((a) => !viewedArtifacts.some((v) => v.id === a.id)),
  ].slice(0, 3);
  return (
    <>
      <PageIntro
        eyebrow="YOUR LEARNING SPACE"
        title={hasLearning ? "欢迎回来，探索者。" : "你好，探索者。"}
        action={
          <Link className="button secondary compact" to="/learn">
            <Icon name="compass" size={18} />
            全部 10 个学院
          </Link>
        }
      >
        {goal
          ? `今天，在${goal.title}的方向上，再发现一点可能。`
          : "不必一次学会所有。带着好奇，今天只向前一小步。"}
      </PageIntro>
      <div className="dashboard-top">
        <section className="feature continue-card">
          <div>
            <span className="eyebrow">
              {hasLearning ? "CONTINUE LEARNING" : "YOUR FIRST DISCOVERY"}
            </span>
            <h2>
              {resume
                ? "接着上次的发现，继续向前。"
                : goal
                  ? `从${goal.title}，开启你的探索。`
                  : "每个好奇，都有一个好起点。"}
            </h2>
            <p>
              {resume
                ? `最近学习：${resume.title}。按自己的节奏，继续练习或回顾。`
                : goal
                  ? "查看这个方向已开放的课程与实践，规划内容会清楚标注。"
                  : "还没有学习记录。十个学院、四个真实可用的实验，等你选择。"}
            </p>
            <Link
              className="button"
              to={resume?.path || (goal ? "/learn/" + goal.id : "/learn")}
            >
              {resume ? "继续学习" : goal ? "查看我的学习方向" : "选择我的起点"}
              <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="discovery-art" aria-hidden="true">
            <div className="orbit-one" />
            <div className="orbit-two" />
            <Icon name="compass" size={58} />
            <span>STAY CURIOUS</span>
          </div>
        </section>
        <section className="card progress-summary">
          <div className="row">
            <Icon name="learn" />
            <h2>一点点，都是进步</h2>
          </div>
          {progress.completed.length || artifacts.length ? (
            <>
              <div className="mini-stat">
                <strong>{progress.completed.length || artifacts.length}</strong>
                <span>
                  {progress.completed.length ? "已完成课时" : "已验证的练习"}
                  <small>
                    {progress.completed.length
                      ? `${activeCourse?.title || "共享课时"}${activeCourse ? " · 共 " + lessons.length + " 节" : ""}`
                      : "来自实际通过检查的本机记录"}
                  </small>
                </span>
              </div>
              {activeCourse && progress.completed.length > 0 && (
                <ProgressBar
                  label="当前课程进度"
                  value={courseCompleted}
                  total={lessons.length}
                />
              )}
              <div className="summary-bottom">
                <span>{artifacts.length} 份真实学习成果</span>
                <Link to="/projects">查看 →</Link>
              </div>
            </>
          ) : (
            <>
              <div className="zero-state-icon">
                <Icon name="spark" size={36} />
              </div>
              <p>第一份进步，来自一次小小的尝试。</p>
              <small>
                完成检查后，进度会自动出现在这里。不会记录虚构的成就。
              </small>
            </>
          )}
          <p className="local-note">记录保存在此设备</p>
        </section>
      </div>
      <SectionTitle
        title={goal ? "为你的目标，安排下一步" : "找到适合你的学习方式"}
        to="/learn"
        label="探索全部学院"
      />
      <p className="section-description">
        {goal
          ? "根据你选择的学习方向推荐；随时可以更换。"
          : "还没决定方向也没关系。先探索、再动手，最后留下自己的成果。"}
      </p>
      <div className="path-grid">
        {goal ? (
          <Link className="card path-card" to={"/learn/" + goal.id}>
            <span className="small-icon">
              <Icon name={goal.id} />
            </span>
            <div>
              <span className="eyebrow">YOUR CHOSEN DIRECTION</span>
              <h3>{goal.title}</h3>
              <p>{academyAvailability(goal.id)} · 按实际开放内容开始</p>
            </div>
            <Icon name="arrow" size={18} />
          </Link>
        ) : (
          <Link className="card path-card" to="/welcome">
            <span className="small-icon">
              <Icon name="compass" />
            </span>
            <div>
              <span className="eyebrow">01 · EXPLORE</span>
              <h3>找到我的学习方向</h3>
              <p>十个同等重要的学院，从兴趣开始。</p>
            </div>
            <Icon name="arrow" size={18} />
          </Link>
        )}
        <Link className="card path-card" to="/lab">
          <span className="small-icon">
            <Icon name="lab" />
          </span>
          <div>
            <span className="eyebrow">02 · EXPERIMENT</span>
            <h3>用一个实验，打开思路</h3>
            <p>Python、逻辑门、Git 与公式，动手验证。</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
        <Link className="card path-card" to="/projects">
          <span className="small-icon">
            <Icon name="projects" />
          </span>
          <div>
            <span className="eyebrow">03 · CREATE</span>
            <h3>把理解，留下来</h3>
            <p>从真实练习收集证据，逐步积累作品。</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
      </div>
      <div className="dashboard-bottom">
        <section>
          <SectionTitle title="最近访问的实验" to="/lab" label="进入实验室" />
          {recentLabs.length ? (
            <div className="card list-card">
              {recentLabs.map((v) => (
                <Link className="recent-row" key={v.path} to={v.path}>
                  <span className="small-icon">
                    <Icon name={v.path.split("/").pop() || "lab"} />
                  </span>
                  <span>
                    <strong>{v.title}</strong>
                    <small>最近访问 · 不代表已通过</small>
                  </span>
                  <Icon name="arrow" size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="card quiet-empty">
              <Icon name="lab" size={28} />
              <h3>还没有访问过实验</h3>
              <p>先选择一个感兴趣的实验，这里会记住你的最近访问。</p>
              <Link className="text-link" to="/lab">
                探索实验
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          )}
        </section>
        <section>
          <SectionTitle
            title={viewedArtifacts.length ? "最近查看的作品" : "最近的学习成果"}
            to="/projects"
            label="我的作品"
          />
          {artifacts.length ? (
            <div className="card list-card">
              {recentProjects.map((a) => (
                <RecentArtifact artifact={a} key={a.id} />
              ))}
            </div>
          ) : (
            <div className="card quiet-empty">
              <Icon name="projects" size={28} />
              <h3>留一个位置，给未来的作品</h3>
              <p>完成实验检查后，真实的学习证据会保存在作品中。</p>
              <Link className="text-link" to="/projects">
                看看可以做什么
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
      <div className="academy-access">
        <Icon name="compass" />
        <div>
          <strong>没有唯一的学习起点。</strong>
          <p>十个学院，平等开放。你的兴趣决定探索方向。</p>
        </div>
        <Link className="button secondary compact" to="/learn">
          浏览全部学院
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </>
  );
}
export function Learn() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const results = academies.filter(
    (a) =>
      (a.title + a.english + a.description)
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (filter === "all" ||
        (filter === "available"
          ? academyCourses(a.id).some((c) => c.status === "available")
          : academyCourses(a.id).some((c) => c.status === "planned"))),
  );
  return (
    <>
      <PageIntro
        eyebrow="TEN ACADEMIES · ONE SHARED SPACE"
        title="十个方向，无限可能。"
      >
        每个学院都值得探索。沿着你的兴趣，找到下一次发现。
      </PageIntro>
      <div className="catalog-toolbar">
        <label className="search search-box">
          <span className="sr-only">搜索学院</span>
          <Icon name="search" size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：开源、Programming"
            type="search"
          />
        </label>
        <div className="filter-group" aria-label="内容筛选">
          {[
            ["all", "全部学院"],
            ["available", "有可用内容"],
            ["planned", "含规划课程"],
          ].map(([id, label]) => (
            <button
              key={id}
              className="filter-button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="result-count">{results.length} 个学院</span>
      </div>
      <h2 className="sr-only">学院目录</h2>
      <div className="grid academy-grid">
        {results.map((a) => (
          <AcademyCard academy={a} key={a.id} />
        ))}
      </div>
      {!results.length && (
        <p role="status" className="card">
          没有找到匹配的学院。试试其他关键词。
        </p>
      )}
      <p className="fine">
        可用练习与完整课程分别标注；规划中的内容不会显示为已经开放。
      </p>
    </>
  );
}
function CourseCard({
  course: c,
  academyId,
}: {
  course: CourseEntry;
  academyId: string;
}) {
  const course = curriculum.get(
    "course",
    c.id === "os-m01" ? "course.opensource-literacy" : c.id,
  );
  const stats = course
    ? courseProgress(
        ref("course", course.id),
        readCurriculumProgress(),
        curriculum,
      )
    : undefined;
  const units = stats?.completed || 0;
  return (
    <article className="card course-card">
      <div className="card-top">
        <Badge muted={c.status !== "available"}>
          {c.status !== "available"
            ? publicationLabels[c.status]
            : c.kind === "course"
              ? qualityLabel(course?.quality)
              : "实践可用"}
        </Badge>
        <span className="fine">
          {c.kind === "course" ? "课程" : "共享练习"}
          {c.minutes ? ` · ${c.minutes} 分钟` : ""}
        </span>
      </div>
      <h3>{c.title}</h3>
      <p>{c.description}</p>
      {stats && (
        <ProgressBar label="你的课程进度" value={units} total={stats.total} />
      )}
      <div className="course-actions">
        {c.status === "available" ? (
          <Link className="text-link" to={c.route}>
            {c.id === "os-m01"
              ? "开始开源基础"
              : c.kind === "practice"
                ? "打开练习"
                : "开始学习"}
            <Icon name="arrow" size={16} />
          </Link>
        ) : (
          <span className="fine">课程尚未开放，不影响探索其他内容。</span>
        )}
        <Link
          className="text-link subtle"
          to={`/learn/${academyId}/curriculum/${c.id}`}
        >
          查看说明
        </Link>
      </div>
    </article>
  );
}
export function Academy() {
  const { academy } = useParams();
  const a = academies.find((a) => a.id === academy);
  if (!a) return <NotFound />;
  const plan = academyPlans[a.id];
  const courses = academyCourses(a.id);
  return (
    <>
      <Link className="back-link" to="/learn">
        ← 所有学院
      </Link>
      <div className="academy-heading">
        <span className="academy-icon">
          <Icon name={a.id} size={30} />
        </span>
        <PageIntro eyebrow={a.english} title={a.title}>
          {a.description}
        </PageIntro>
      </div>
      <div className="academy-overview">
        <section className="card">
          <span className="eyebrow">WHAT YOU WILL EXPLORE</span>
          <h2>在这里，建立你的理解。</h2>
          <ul className="objectives">
            {plan.objectives.map((o) => (
              <li key={o}>
                <Icon name="check" size={18} />
                {o}
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <span className="eyebrow">BEFORE YOU START</span>
          <h2>按自己的节奏开始</h2>
          <p>{plan.prerequisites}</p>
          <Badge muted={academyAvailability(a.id) === "课程规划中"}>
            {academyAvailability(a.id)}
          </Badge>
          <p className="fine">
            实践可用不代表整套课程已完成。所有学院使用相同的课程与实验入口。
          </p>
        </section>
      </div>
      <SectionTitle title="从入门到实践，逐步探索" />
      <div className="curriculum-levels">
        {(["beginner", "intermediate", "advanced"] as const).map((level, i) => (
          <section className="curriculum-level" key={level}>
            <div className="level-heading">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{levelLabels[level]}</h2>
                <small>
                  {["建立基础理解", "连接知识与情境", "用作品验证所学"][i]}
                </small>
              </div>
            </div>
            <div className="course-list">
              {courses
                .filter((c) => c.level === level)
                .map((c) => (
                  <CourseCard course={c} academyId={a.id} key={c.id} />
                ))}
            </div>
          </section>
        ))}
      </div>
      <div className="academy-overview">
        <section className="card">
          <h2>练习与作品</h2>
          <p>
            已开放的练习可保存真实通过证据。学院专属项目仍在规划，不展示虚构成果。
          </p>
          <Link className="text-link" to="/projects">
            查看本机作品与练习模板
            <Icon name="arrow" size={16} />
          </Link>
        </section>
        <section className="card">
          <h2>还可以连接这些方向</h2>
          <p>按兴趣延伸，不是必修门槛。</p>
          <div className="related-links">
            {plan.related.map((id) => (
              <Link key={id} to={"/learn/" + id}>
                <Icon name={id} size={18} />
                {academies.find((x) => x.id === id)?.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
export function CourseDetails() {
  const { academy, courseId } = useParams();
  const a = academies.find((a) => a.id === academy);
  const course = a && academyCourses(a.id).find((c) => c.id === courseId);
  if (!a || !course) return <NotFound />;
  return (
    <section className="prose">
      <Link className="back-link" to={"/learn/" + a.id}>
        ← {a.title}
      </Link>
      <PageIntro eyebrow={levelLabels[course.level]} title={course.title}>
        {course.description}
      </PageIntro>
      <div className="card">
        <Badge muted={course.status !== "available"}>
          {course.status === "available"
            ? course.kind === "practice"
              ? "实践可用"
              : qualityLabel(
                  curriculum.get(
                    "course",
                    course.id === "os-m01"
                      ? "course.opensource-literacy"
                      : course.id,
                  )?.quality,
                )
            : publicationLabels[course.status] + " · 尚未开放"}
        </Badge>
        <h2>学习目标与准备</h2>
        <ul className="objectives">
          {academyPlans[a.id].objectives.map((o) => (
            <li key={o}>
              <Icon name="check" size={18} />
              {o}
            </li>
          ))}
        </ul>
        <p>{academyPlans[a.id].prerequisites}</p>
        <details className="related-courses">
          <summary>相关课程与共享练习</summary>
          <div className="related-links">
            {academyCourses(a.id)
              .filter((c) => c.id !== course.id)
              .map((c) => (
                <Link
                  key={c.id}
                  to={
                    c.status === "available"
                      ? c.route
                      : `/learn/${a.id}/curriculum/${c.id}`
                  }
                >
                  <span>
                    {c.title}
                    <small>
                      {c.status === "planned"
                        ? " · 规划中"
                        : c.kind === "practice"
                          ? " · 实践可用"
                          : " · 可学习"}
                    </small>
                  </span>
                  <Icon name="arrow" size={16} />
                </Link>
              ))}
          </div>
        </details>
        {course.status === "available" ? (
          <Link className="button" to={course.route}>
            进入{course.kind === "practice" ? "练习" : "课程"}
            <Icon name="arrow" size={18} />
          </Link>
        ) : (
          <p>
            这项课程尚未实现，当前没有可运行课时或测评。你可以回到学院查看真实可用的共享练习。
          </p>
        )}
      </div>
    </section>
  );
}
function ProjectCard({ artifact: a }: { artifact: Artifact }) {
  return (
    <article className="card project-card">
      <div className="project-cover">
        <Icon
          name={
            a.kind === "python"
              ? "python"
              : a.id === "worksheet"
                ? "learn"
                : a.id
          }
          size={48}
        />
        <span>LEARNING EVIDENCE</span>
      </div>
      <div className="project-content">
        <Badge>已通过检查 · 本机</Badge>
        <h2>
          <Link to={"/projects/" + a.id}>{a.title}</Link>
        </h2>
        <p>{a.description}</p>
        <div className="project-meta">
          <span>证据已保存</span>
          <Link className="text-link" to={"/projects/" + a.id}>
            查看成果
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function Projects() {
  const [filter, setFilter] = useState("all");
  const artifacts = readArtifacts();
  const results = artifacts.filter(
    (a) =>
      filter === "all" ||
      (filter === "lab"
        ? a.kind === "lab" || a.kind === "python"
        : filter === "course"
          ? a.kind === "curriculum"
          : a.kind === "worksheet"),
  );
  return (
    <>
      <PageIntro
        eyebrow="YOUR PRIVATE COLLECTION"
        title="你的创造，从这里生长。"
      >
        每一次亲手验证，都能留下真实的学习证据。当前成果仅保存在这台设备。
      </PageIntro>
      <div className="catalog-toolbar">
        <div className="filter-group" aria-label="作品类型">
          {[
            ["all", "全部成果"],
            ["lab", "实验与 Python"],
            ["worksheet", "学习工作表"],
            ["course", "课程成果"],
          ].map(([id, label]) => (
            <button
              className="filter-button"
              key={id}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="result-count">{results.length} 份成果</span>
      </div>
      {results.length ? (
        <div className="grid project-grid">
          {results.map((a) => (
            <ProjectCard key={a.id} artifact={a} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={artifacts.length ? "还没有这类成果" : "还没有作品"}
          to="/lab"
          label="从一个小实验开始"
        >
          {artifacts.length
            ? "切换类型可以查看已经保存的真实成果。"
            : "不必等待一个大项目。完成一次实验检查，就能收集你的第一份证据。"}
        </EmptyState>
      )}
      <SectionTitle title="从一个真实的练习开始" to="/lab" label="全部实验" />
      <p className="section-description">
        这些起步模板连接到已经实现的练习。独立项目编辑器、云端项目保存和发布功能尚未开放。
      </p>
      <div className="template-grid">
        {labCatalog.map((l) => (
          <Link className="card template-card" key={l.id} to={"/lab/" + l.id}>
            <span className="small-icon">
              <Icon name={l.id} />
            </span>
            <h3>{l.title}</h3>
            <p>{l.description}</p>
            <span className="text-link">
              进入真实练习
              <Icon name="arrow" size={16} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
export function ProjectDetail() {
  const { projectId } = useParams();
  const a = readArtifacts().find((a) => a.id === projectId);
  if (!a)
    return (
      <>
        <Link className="back-link" to="/projects">
          ← 我的作品
        </Link>
        <h1>这台设备还没有这份成果</h1>
        <EmptyState
          title="从真实练习开始积累"
          to="/projects"
          label="查看本机作品"
        >
          成果可能保存在另一浏览器。这里不会为缺失的记录生成完成状态。
        </EmptyState>
      </>
    );
  return (
    <>
      <Link className="back-link" to="/projects">
        ← 我的作品
      </Link>
      <PageIntro
        eyebrow="VERIFIED BY PRACTICE · LOCAL EVIDENCE"
        title={a.title}
        action={
          <button className="secondary" onClick={() => exportArtifact(a)}>
            导出学习证据
            <Icon name="arrow" size={18} />
          </button>
        }
      >
        {a.description}
      </PageIntro>
      <div className="project-detail-grid">
        <section className="card">
          <Badge>练习检查已通过</Badge>
          <h2>把这次发现，留下来。</h2>
          <p>
            此记录来自已完成的练习检查，不是外部认证或云端作品。重新练习不会自动抹除已有证据。
          </p>
          <ul className="objectives">
            <li>
              <Icon name="check" size={18} />
              任务结果已保存
            </li>
            <li>
              <Icon name="check" size={18} />
              仅存储在当前浏览器
            </li>
          </ul>
          <Link className="button" to={a.source}>
            回到原练习
            <Icon name="arrow" size={18} />
          </Link>
        </section>
        <section className="card">
          <h2>证据详情</h2>
          <p className="fine">原始记录只在这里按需展开；导出由你主动触发。</p>
          <details>
            <summary>查看保存的学习记录</summary>
            <pre>{JSON.stringify(a.data, null, 2)}</pre>
          </details>
          <p className="fine">
            保存时间：{a.completedAt.replace("T", " ").replace("Z", " UTC")}
          </p>
        </section>
      </div>
    </>
  );
}
export function NotFound() {
  return (
    <>
      <PageIntro eyebrow="LET’S FIND ANOTHER WAY" title="找不到这个页面">
        换一个入口，继续你的探索。
      </PageIntro>
      <Link className="button" to="/home">
        回到首页
        <Icon name="arrow" size={18} />
      </Link>
    </>
  );
}
