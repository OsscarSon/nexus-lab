# UI/UX Site-wide Specification

## Design principles
Quiet, bright, modern science laboratory; simple first, advanced on demand. Friendly to teens and beginner learners. No intimidating dashboard metrics, dense neon UI, unnecessary gamification or infinite sidebars.

## Tokens
Canvas #F7F9FC; card #FFFFFF; ink #16273A; muted #64748B; accent #70CDB6; accent-secondary #91AFCB; borders #E5EBF1; focus visible high contrast. Dark mode optional. Primary content max width 1160px; prose max width 720px. Space scale 4/8/12/16/24/32. 8–16px radii by component size. Use readable sizes, clear focus rings, reduced motion settings, and accessible color contrast.

## Global nav
Desktop: slim left rail with Home, Learn, Lab, Projects, Me; top global search, help, account. Mobile: bottom five-item nav, responsive drawers, no permanent desktop sidebars. Floating contextual Mentor only in lessons/labs; optionally launch from global search. User should never see >5 major navigation options at once.

## Route inventory
- `/` landing: clear value proposition, try free lesson, explore tracks, privacy/AI summary.
- `/welcome` onboarding: choose goal, optional level and language; skip allowed.
- `/home` home: one continue-learning CTA, current path progress, recent projects, one recommended lab.
- `/learn` academy directory: 10 academy cards, search, beginner filters.
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
First-time learner: starting from `/`, choose an AI, open-source or Workspace goal and open first lab within <=4 clear clicks. No API key prompt. All important touch targets >=44px; keyboard tab order logical; all basic lessons work on mobile; slow network degrades gracefully.
