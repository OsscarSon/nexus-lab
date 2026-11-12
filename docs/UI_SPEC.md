# UI/UX Site-wide Specification

## Design principles
十个学院同等重要，无主次之分。实现时间与课程数量不决定导航地位或卡片视觉权重。遵循 [PRODUCT_SPEC.md](PRODUCT_SPEC.md) 的内容发布/学习进度状态区分与 [ROADMAP.md](ROADMAP.md) 的后续排期。

Quiet, bright, modern science laboratory; simple first, advanced on demand. Friendly to teens and beginner learners. No intimidating dashboard metrics, dense neon UI, unnecessary gamification or infinite sidebars.

## Tokens
Canvas #F7F9FC; card #FFFFFF; ink #16273A; muted #64748B; accent #70CDB6; accent-secondary #91AFCB; borders #E5EBF1; focus visible high contrast. Dark mode optional. Primary content max width 1160px; prose max width 720px. Space scale 4/8/12/16/24/32. 8–16px radii by component size. Use readable sizes, clear focus rings, reduced motion settings, and accessible color contrast.

## Global nav
Desktop: slim left rail with Home, Learn, Lab, Projects, Me; top global search, help, account. Mobile: bottom five-item nav, responsive drawers, no permanent desktop sidebars. Floating contextual Mentor only in lessons/labs; optionally launch from global search. User should never see >5 major navigation options at once.

## Route inventory
- `/` landing: clear value proposition, try free lesson, explore tracks, privacy/AI summary.
- `/welcome` onboarding: all ten academy goals with equal controls, optional level and language; no academy preselected globally; free exploration and skip allowed.
- `/home` home: one continue-learning CTA based on the learner’s selected path or actual recent activity, current path progress, recent projects, one explained recommendation and an all-academies link. No hardcoded academy default; an empty profile offers balanced exploration.
- `/learn` academy directory: ten equally discoverable academy cards, identical information hierarchy, search and beginner filters; stable non-ranked order, no permanent featured academy. Planned academies remain visible with honest course-level availability.
- `/learn/:academy` academy overview: outcomes, roadmap, beginner start CTA, projects.
- `/learn/:academy/:course` course outline: modules, prerequisites, time, project outcome, progress.
- `/lesson/:lessonId` lesson: title, objective, one concept, illustration, live example, challenge, help; desktop optional two-pane; mobile tabs.
- `/paths` learning path directory and plan detail.
- `/lab` searchable 12+ labs, difficulty, device labels.
- `/lab/:labId` focused workspace: task, editor/interactive surface, results, hints, save.
- `/opensource/explorer` controlled GitHub metadata inspector, file map, trust and licensing notes.
- `/opensource/git-playground` simulated Git training, graph and guided commands.
- `/workspace` Workspace pathway landing and six studios.
- `/workspace/:studio` tutorials, practice mission and sample documents.
- `/projects` private project library, templates, folders and filters.
- `/projects/:id` project overview, files, preview, milestones, versions; no destructive actions without confirm.
- `/toolbox` utilities catalog with search and recent tools.
- `/passport` verified skills, evidence, completed labs, portable export.
- `/me` profile and progress, language, theme, accessibility.
- `/settings/ai` current plan/provider, usage, opt-in local model, optional advanced BYOK.
- `/admin` protected management route: content publishing, provider limits, costs and abuse monitoring.

## Lesson layout
Desktop: 240px collapsible lesson outline, 55% readable lesson pane, optional 45% lab/preview pane; collapse outline by default for small laptops. Mobile: lesson body with sticky `Try` button and tabs `Learn | Practice | Result`; bottom nav hidden during full-screen editor. Mentor opens as drawer, never obscures task.

## Key UI states
Every asynchronous surface has loading, skeleton, empty, error, offline, rate-limited and success states. Labs have explicit `simulation` vs `real execution` labels. Google integrations show scopes and confirmation before mutating a user's account. Never silently bill, send emails or publish a repository.

## Core components
AcademyCard, CourseCard, LessonStep, ConceptExplanation, GuidedExample, CodeEditorAdapter, LabWorkspace, CheckResult, DifficultyChip, LearningPathCard, MentorDrawer, ProjectTile, SafePermissionDialog, UsageMeter, DeviceCapabilityNotice.

## UX acceptance
First-time learner: starting from `/`, choose any of the ten academy goals with equal navigation depth. If a relevant lab is available, open it within <=4 clear clicks; otherwise show its real planned status and optional shared exercises without implying the academy curriculum is complete. No API key prompt. All important touch targets >=44px; keyboard tab order logical; all basic lessons work on mobile; slow network degrades gracefully.

## 跨学院一致性验收（目标，尚未全部实现）

所有学院复用同一课程概览、课时、测评反馈、进度和作品组件。共享课时显示当前路径的返回入口与已有证据，不要求绕道原始实现学院。学院图标/强调色可不同，但卡片尺寸、标题级别、按钮能力与访问深度一致；筛选后的结果可以不同，不形成永久主次。

课程卡分别显示内容发布状态与该学习者进度，例如“可学习 · 尚未开始”“可学习 · 你已完成”“规划中”。不能用一个“完成”标签同时代表开发完成和学习完成。规划内容可以查看目标与路线图，但没有假运行、假测评或虚假作品。项目模板与实验入口采用共同能力检查和设备说明，不按学院身份限制。
