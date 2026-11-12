import { STATIC_DEPLOYMENT, STATIC_NOTICE } from "./deployment";
import React, { Component, type ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { academies } from "../../../content/catalog";
import {
  Home,
  Welcome,
  Learn,
  Academy,
  Projects,
  ProjectDetail,
  CourseDetails,
  NotFound,
} from "./pages";
import { Icon } from "./components/icon";
import { recordVisit } from "./activity";
import { Account, AISettings } from "./account";

import "./style.css";
import "./ui-v2.css";
import { LabDirectory, LabRoute } from "./labs";
const Course = React.lazy(() =>
  import("./learning").then((module) => ({ default: module.Course })),
);
const Lesson = React.lazy(() =>
  import("./learning").then((module) => ({ default: module.Lesson })),
);
const Assessment = React.lazy(() =>
  import("./learning").then((module) => ({ default: module.Assessment })),
);
const GenericAssessment = React.lazy(() =>
  import("./learning").then((module) => ({
    default: module.GenericAssessment,
  })),
);
const nav = [
  ["/home", "home", "首页", "Home"],
  ["/learn", "learn", "学习", "Learn"],
  ["/lab", "lab", "实验室", "Lab"],
  ["/projects", "projects", "作品", "Projects"],
  ["/me", "me", "我的", "Me"],
];
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main>
        <h1>页面暂时无法显示</h1>
        <p>学习记录保存在此设备。请重新加载后重试。</p>
        <a
          href={
            STATIC_DEPLOYMENT ? `${import.meta.env.BASE_URL}#/home` : "/home"
          }
        >
          返回首页
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Landing() {
  return (
    <section className="hero">
      <span className="eyebrow">A SPACE FOR CURIOUS MINDS</span>
      <h1>
        每一个好奇，
        <br />
        都可以成为<span>新的可能。</span>
      </h1>
      <p>
        从理解技术到亲手创造。用短课、互动实验和自己的节奏，
        <br />
        探索属于你的科技世界。
      </p>
      <Link className="button" to="/welcome">
        找到我的起点 ↗
      </Link>{" "}
      <Link className="button secondary" to="/learn">
        探索学习方向
      </Link>
      <div className="orb" aria-hidden="true">
        N<span>LEARN · EXPERIMENT · CREATE</span>
      </div>
      <p className="fine">无需账户即可开始 · 学习记录保存在此设备 · AI 可选</p>
    </section>
  );
}
function VisitObserver() {
  const { pathname, search } = useLocation();
  React.useEffect(() => {
    recordVisit(pathname + search);
  }, [pathname, search]);
  return null;
}
function Breadcrumb() {
  const { pathname } = useLocation();
  const a = academies.find((a) => pathname.startsWith("/learn/" + a.id));
  const title =
    a?.title ||
    (
      {
        "/home": "学习空间",
        "/learn": "学院目录",
        "/lab": "互动实验室",
        "/projects": "作品与证据",
        "/me": "我的空间",
        "/welcome": "选择方向",
      } as Record<string, string>
    )[pathname] ||
    (pathname.startsWith("/lesson/")
      ? "课时学习"
      : pathname.startsWith("/lab/")
        ? "互动实验室"
        : pathname.startsWith("/projects/")
          ? "作品详情"
          : "探索空间");
  return (
    <span className="breadcrumb">
      探索 <span>/</span> {title}
    </span>
  );
}
const Router = STATIC_DEPLOYMENT ? HashRouter : BrowserRouter;
function App() {
  const [online, setOnline] = useState(navigator.onLine);
  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <Router>
      <VisitObserver />
      <a
        className="skip"
        href="#main"
        onClick={
          STATIC_DEPLOYMENT
            ? (event) => {
                event.preventDefault();
                document.getElementById("main")?.focus();
              }
            : undefined
        }
      >
        跳到主要内容
      </a>
      <aside>
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Icon name="lab" size={24} />
          </span>
          <span>
            NEXUS LAB<small>好奇心的实验室</small>
          </span>
        </Link>
        <nav aria-label="主要导航">
          {nav.map(([path, icon, zh, en]) => (
            <NavLink key={path} to={path}>
              <Icon name={icon} />
              <span>
                {zh}
                <small>{en}</small>
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="rail-note">
          STAY CURIOUS.
          <br />
          每天一个小发现。
        </div>
      </aside>
      <div className="shell">
        <header>
          <Breadcrumb />
          <Link
            className="header-search"
            to="/learn"
            aria-label="搜索与探索学院"
          >
            <Icon name="search" size={18} />
            <span>搜索与探索学院</span>
          </Link>
          <Link className="avatar" aria-label="我的账户" to="/me">
            N
          </Link>
        </header>
        {!online && (
          <p className="notice" role="status">
            当前离线。已加载的课程仍可阅读；在线服务暂不可用。
          </p>
        )}
        {STATIC_DEPLOYMENT && <p className="notice">{STATIC_NOTICE}</p>}
        <main id="main" tabIndex={-1}>
          <Boundary>
            <React.Suspense fallback={<p role="status">正在加载学习内容…</p>}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/home" element={<Home />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:academy" element={<Academy />} />
                <Route
                  path="/learn/opensource/foundations"
                  element={<Course />}
                />
                <Route
                  path="/learn/opensource/assessment"
                  element={<Assessment />}
                />
                <Route path="/lesson/:lessonId" element={<Lesson />} />
                <Route path="/course/:courseId" element={<Course />} />
                <Route
                  path="/assessment/:assessmentId"
                  element={<GenericAssessment />}
                />
                <Route path="/lab" element={<LabDirectory />} />
                <Route path="/lab/:labId" element={<LabRoute />} />
                <Route
                  path="/opensource/git-playground"
                  element={<LabRoute />}
                />
                <Route path="/projects" element={<Projects />} />
                <Route
                  path="/projects/:projectId"
                  element={<ProjectDetail />}
                />
                <Route
                  path="/learn/:academy/curriculum/:courseId"
                  element={<CourseDetails />}
                />
                <Route path="/me" element={<Account />} />
                <Route path="/settings/ai" element={<AISettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </Boundary>
          <footer>
            <span>NEXUS LAB</span> 从好奇到创造。
            <span>以自己的节奏，向前一步。</span>
          </footer>
        </main>
      </div>
    </Router>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
