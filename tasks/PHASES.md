# 历史阶段记录与兼容验收

本文件记录初始实现顺序，不定义学院主次。十个学院同等重要；开源学院只是首个学习引擎案例。后续优先级以 [docs/ROADMAP.md](../docs/ROADMAP.md) 为准，禁止因为先实现而持续优先。旧阶段的待实现工具可作为共享能力规划，不能替代平等学院的目录与通用引擎工作。

## Phase 0 — Repo and UX foundation

Set up monorepo, TS strict, React/Vite, router, CSS tokens, five-item nav, reusable layout and error boundary. Seed ten academy catalog entries from fixtures, landing/onboarding/home/learn shells. Real responsive behavior. Completion: navigation and first-time user flow work in desktop/mobile widths; no dead primary CTA.

## Phase 1 — 首个共享引擎案例：Open Source foundations

Initial target: M01 five lessons (the delivered curriculum has six lessons), lesson renderer, progress locally, hint panel with authored explanations, GitHub concepts micro-simulator and end-of-unit quiz. Course data in schema-validated files. Completion: learner finishes course start-to-end, persists locally on refresh, without signup/API key.

## Phase 2 — Labs foundation

Standard lab adapter contract; Logic Gate lab and Git staging simulator; reset, run/check, solution hints, accessible controls. Completion: rubric tests and an end-to-end lab path.

## Phase 3 — Python / Workspace sample

Curated Pyodide worker examples with support detection and bounded execution. Spreadsheet formula practice with a clearly labeled limited teaching interpreter, not fake Excel. Completion: actual sample code runs in supportable browser; formula validates given sample and reports unsupported expressions.

## Phase 4 — Optional account and AI Mentor

Introduce auth/progress sync, basic fallback help, server-side rate-limited AI gateway, provider adapter, usage meters and budget stops. Completion: new user needs no key; platform API key never reaches client; quota exhaustion gracefully falls back.

## 历史 Phase 5 — Open Source Explorer（已被 Issue #1 替代）

当前 Phase 5 为 Ten Academy Curriculum Foundation：5A 学院中立、5B 共享课程图、5C 通用学习与兼容证据、5D 十学院真实入门模块。Explorer 留待后续跨学院能力，不属于本轮主要范围。

GitHub public metadata, file tree and README with rate limiting, no repo execution. License status explicitly unknown if absent. Completion: user enters repo URL and sees validated data, errors and safe warnings.

## Phase 6 — Projects and Workspace

Project templates, private save/export, Workspace simulated mission. Google OAuth later, only after permission/security review. Completion: user can produce a tangible artifact and export it.

## 后续学院内容交付（不按“其余学院”排序）

十个学院均按统一课程、互动、测评、进度与作品契约逐步交付。每轮依据需求、先修依赖与验证成本选择切片，不把非开源学院整体放到末尾。共享 Git、GitHub、Python、API、云部署内容通过稳定引用复用。发布课程覆盖情况前先核实真实可用内容和审核状态；具体后续里程碑与验收见 ROADMAP。

## Definition of done per task

Type-safe and tested; functional UI; mobile + keyboard support; verified loading and error state; course data maintained; status docs updated; Git commit; screenshots or reproducible test steps.
