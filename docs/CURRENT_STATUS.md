# Current status

Phases 0–3 are implemented and verified. Phase 4 account/sync, gateway controls and non-generative assistance are implemented and verified locally; live AI provider validation is blocked by absent server credentials/configuration. No public deployment, remote CI run or environment publication has been verified. Development branch: `development/phases-0-4`; stable branches have not been overwritten.

## 十个学院平等：本轮文档更新与真实实现边界

已采纳：十个学院同等重要，不设主学院或次学院。开源 M01 只是首个学习引擎实现案例。PRODUCT_SPEC、ARCHITECTURE、UI_SPEC、ROADMAP 和历史 PHASES 已对齐：全部学院拥有同等入口及共同的课程、互动课、测评、进度与作品契约；共享主题通过稳定 ID 和依赖图复用。

**本轮仅更新规范与文档。共享课程图、跨学院通用渲染/进度迁移和中立推荐尚未实现。** 既有课程、路由、ID、localStorage 键、SQLite 数据格式和实际学习数据均未修改；此前 Phases 0–4 的可用功能与 AI 凭据阻塞保持原状。

### 当前已验证内容与规划内容

| 学院 | 当前已有学习内容/能力 | 尚待规划或实现的范围 |
| --- | --- | --- |
| 编程 | 平台实验目录有三个真实 Python 微课（变量、循环、函数） | 独立编程学习路径与统一课程图接入尚未实现 |
| 人工智能 | 学院目录与目标页面；平台共享 Mentor 网关/回退可用 | 学院课程、练习、测评与作品路径规划中；共享 Mentor 不代表 AI 学院课程完成 |
| 游戏开发 | 学院目录与目标页面 | 学院课程、练习、测评与作品路径规划中 |
| 计算机工程 | 平台实验目录有逻辑门模拟与真值表挑战 | 学院课程编排与统一学习证据接入尚未实现 |
| 网站与云端 | 学院目录与目标页面 | API/云部署等课程与作品路径规划中 |
| 网络与安全 | 学院目录与目标页面 | 学院课程、练习、测评与作品路径规划中 |
| 机器人与物联网 | 学院目录与目标页面 | 学院课程、练习、测评与作品路径规划中 |
| 未来科技 | 学院目录与目标页面 | 学院课程、练习、测评与作品路径规划中 |
| 效率与自动化 | 平台实验目录有真实公式计算练习 | 学院完整课程/任务路径与共同作品接入尚未实现 |
| 开源学院 | M01 六课、检查题、分类测评/本机工作表；共享 Git 模拟可用 | M02–M12 课程尚未实现；首个模块不代表整学院已完成 |

上表不重新分配现有实验所有权。Python、逻辑门、公式与 Git 是可复用能力，不能因为首先在某处展示就成为该学院的独占资源。上述“已验证”指历史技术/功能检查，内容尚未经过外部专家审核。

### 已确认的架构差距与下一步

- 十学院已有同级目录卡片，但首次引导仅列三个方向且默认开源；首页首个课时/续学以及推荐方向仍有固定选择，不满足新的中立策略。
- `apps/web/src/learning.tsx`、课程路由、进度统计与账号界面仍以开源六课为基准；`available` 学院级布尔值不足以表达各课程发布状态。
- 服务端进度 ID 校验、Mentor 课程上下文及无上下文回退仍直接引用开源列表。不能宣称所有学院已获得完整通用引擎接入。
- 实验框架、真实 Python、公式引擎和本机证据可用；共享课程注册表、依赖图、跨路径完成抵扣和统一项目模板/保存能力尚待实现。

下一轮优先按 ROADMAP 的 A→B→C 落实平等入口、共享注册表/依赖图和兼容进度迁移，再依据实际需求选择十学院的课程切片；不因开源实现较早继续默认优先。实时 AI 验证仍是可独立处理的凭据阻塞项，不阻塞本次架构方向。

本轮验证结果见文末“平等学院文档变更验证”；以下阶段检查保留为历史证据，不将设计更新计作新功能交付。

The sections below preserve each sequential phase checkpoint.

## Phase 0 — verified

React/TypeScript/Vite workspace scaffold; ten schema-validated academy cards; Chinese-first design tokens; five responsive primary navigation destinations; landing, goal onboarding with persistent preference and skip; searchable directory and academy routes; local-profile, empty-project and planned-lab states; error boundary, offline notice and unknown-route recovery.

Validation: frozen dependency installation, `pnpm typecheck`, `pnpm lint`, `pnpm test` (1 domain test), `pnpm build`, Playwright desktop/mobile onboarding, preference persistence, directory search and viewport overflow checks.

No course lessons, functional labs or AI exist at this checkpoint. Next: Phase 1 learning engine and authored Open Source M01 course.

## Phase 1 — verified

Six authored, schema-validated M01 lessons cover source code, permissions, community, libraries, supply-chain trust and attribution (six follows the curriculum's complete topic list). Readable lessons include objectives, worked examples, references, quiz feedback, authored hints and next-lesson navigation. A file-inspection micro-simulator teaches README/source/license differences. Progress is versioned, validated, deduplicated and saved only after a correct answer. Home resumes the first incomplete lesson. End-of-module license decision worksheet saves a local artifact visible in Projects.

Validation: `pnpm typecheck`, `pnpm lint`, `pnpm test` (4 tests), `pnpm build`; desktop/mobile Playwright wrong-answer feedback, six-lesson completion, assessment and persisted progress (4 browser tests including Phase 0 regression).

Content is original teaching material, not externally expert-reviewed; references link to OSI and GitHub. Progress is device-local; no cloud synchronization. Next: shared lab contracts, Git simulator and logic gates.

## Phase 2 — verified

Generic typed lab adapter and shared workspace with challenge evaluation, reset, undo (50 recent actions), accessible feedback and local success evidence. Git simulation models independent working/staging snapshots, branch selection, commit messages and readable history; never invokes Git or a shell. Logic simulation implements AND/OR/XOR/NOT, live inputs and independent four-row prediction challenges. `/lab`, `/lab/git`, `/lab/logic` and `/opensource/git-playground` are available. Future labs are not advertised as available.

Validation: typecheck, lint, 9 unit/domain tests, production build, 8 desktop/mobile browser tests. Tests verify staging semantics, branch requirements, all truth-table combinations, failed and successful challenges, reset and undo. Earlier phase flows continue to pass.

Current limitations: Git is a deliberately scoped teaching simulator; merging, conflicts and real repositories are outside this phase. Next: real bounded browser Python and a defined spreadsheet formula interpreter.

## Phase 3 — verified

Pinned Pyodide 0.29.3 is copied from the integrity-locked npm package into local static assets at dev/build time; no runtime CDN dependency. The lazy Python view starts a dedicated worker only on request. Three real Python micro-lessons (variables, accumulation, functions/conditions) accept bounded integer inputs and validate actual CPython output. Stop terminates the worker; loading has a 45-second deadline and execution a 5-second deadline. Programs are curated, not arbitrary code, so no arbitrary imports/packages are exposed. Output is capped at 10 KB.

Spreadsheet interpreter supports numeric literals, cell references, + - * /, unary signs, parentheses, SUM/AVERAGE/MIN/MAX with same-column ranges or argument lists. It detects unknown references, unsupported functions, division by zero, cycles and bounded nesting. No eval or dynamic code execution. Budget challenge is checked against multiple input fixtures to reject hardcoded answers.

Validation: typecheck, lint, 23 domain tests, build, 12 desktop/mobile browser tests. Browser tests actually load WebAssembly and execute all three Python programs, assert outputs 14 / 15 / True, then terminate the worker. Formula tests exercise success, changing cells, unsupported expressions and hardcoded answer rejection. Earlier tests remain green.

Formatting is standardized with Prettier. Optional arbitrary Python editing, PyPI imports, full Excel compatibility and offline PWA caching are outside this scope. Next: authenticated server AI gateway with durable limits and honest fallback.


## Phase 4 — implemented; live provider verification blocked

Node 24 HTTP/SQLite backend with optional username/password registration, salted scrypt hashes, hashed seven-day sessions, login/logout/revocation, account deletion and account-isolated versioned course-progress merge. Authenticated APIs validate origin/content type, custom CSRF header, schema/size bounds and per-IP risk limits. SQLite persists rate/quota reservations across process restarts. Deleting accounts anonymizes the financial ledger instead of refunding global spending.

Contextual Mentor provides Explain / Hint / Debug / Build modes. Client and server clearly identify authored assistance as non-generative. The server-only OpenAI-compatible adapter supports bounded, abortable HTTPS chat responses. No client keys, external tools or repository execution. A request reserves conservative token and micro-USD estimates before provider access; per-user rates/daily tokens/monthly budget, global monthly budget and concurrency are checked atomically. Usage reconciliation is fail-closed, retains uncertain charges and durably stops paid calls on billing failures. Usage/settings disclose actual enablement and limits; BYOK is disabled and credential fields are rejected.

Final validation:

- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm test` — 41 tests passed (content/progress, lab semantics, formulas, HTTP/auth/tenant isolation, quota persistence/concurrency/caps, provider validation and error handling).
- `pnpm build` — passed; Python/formula views are separate chunks, Pyodide assets served locally. Harmless upstream Zod Rollup annotation warnings remain.
- `CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e` — 20 passed across desktop/mobile: full learner path, real Python, lab challenges, formulas, optional account sync across browser contexts, logout/deletion, all four non-generative modes, rate-limited/offline degradation, WCAG A/AA automated scans on seven representative screens, and no horizontal overflow.
- `CHROMIUM_PATH=/usr/bin/chromium pnpm test:production` — passed: compiled SPA routing, real Python and anonymous fallback under production CSP. HTTPS production account deployment is not covered by the local HTTP smoke test.
- `pnpm audit --prod` — no known vulnerabilities reported.
- Desktop/mobile Home and Lesson screenshots generated by Playwright and reviewed. GitHub Actions workflow added; remote CI has not run here.

### Exact blocker and next safe work

No server provider key, endpoint/model or current token prices are configured. Live AI has never been called or validated in this environment. Configure server-only settings described in `docs/ENVIRONMENT.md`, allow the provider hostname when required, explicitly enable AI and run an authenticated metered smoke test before calling Phase 4 fully verified. Do not enter keys in chat or commit them. Default course assistance and all local learning features remain usable without these settings.

Deferred limitations: no BYOK/local generative model, streaming, password recovery/MFA, cloud lab artifact sync, multi-instance distributed ledger, full Excel, arbitrary Python execution, PWA offline installation or externally reviewed curriculum. Optional accounts run on this backend, not a deployed managed identity service. The original next-task suggestion was account/privacy hardening or a credentialed provider smoke test. It is superseded by the equal-academy roadmap above; these remain independently useful work. Phases 5+ have not started. See `docs/ENVIRONMENT.md` for reproducible startup, data retention, quotas, proxy settings and deployment boundaries.


## 平等学院文档变更验证

本轮只修改 README、AGENTS、PRODUCT_SPEC、ARCHITECTURE、UI_SPEC、CURRENT_STATUS、历史 PHASES，并新增 ROADMAP。没有改动应用代码、课程内容、依赖/锁文件、学习数据格式或数据库；没有运行迁移。

`pnpm typecheck`、`pnpm lint`、`pnpm test`（41 项）及 `pnpm build` 全部通过；`git diff --check` 通过。构建仍仅有既有 Zod 注解警告。已检查本轮文档的相对链接与十学院覆盖。未重复运行浏览器或实时 AI 检查，不将历史 20 项浏览器结果计作本轮新执行结果。
