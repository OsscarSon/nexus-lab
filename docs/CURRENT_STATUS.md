# Current status

Phases 0–3 remain implemented; Phase 4 accounts/sync, gateway controls and non-generative assistance remain available, while live AI still requires unconfigured provider credentials. UI/UX V2 is implemented on `develop/ui-v2`; its current validation and limitations are summarized in the final UI V2 section below. This branch has not been pushed or deployed.

上次发布已核实 `main` 为 `fb28a6f`，远端质量检查通过；当时 Pages 部署被仓库启用设置阻塞。本轮没有重新检查线上状态，也没有修改远端 main。以下旧阶段与文档检查点保留为历史记录，最新 UI 实现状态以文末为准。

## 历史检查点：十个学院平等文档与当时实现边界

已采纳：十个学院同等重要，不设主学院或次学院。开源 M01 只是首个学习引擎实现案例。PRODUCT_SPEC、ARCHITECTURE、UI_SPEC、ROADMAP 和历史 PHASES 已对齐：全部学院拥有同等入口及共同的课程、互动课、测评、进度与作品契约；共享主题通过稳定 ID 和依赖图复用。

**该历史检查点仅更新规范与文档。当时共享课程图、跨学院通用渲染/进度迁移和中立推荐尚未实现；UI V2 已落实中立入口与呈现层，完整课程图和服务端迁移仍待后续。** 既有课程、路由、ID、localStorage 键、SQLite 数据格式和实际学习数据均未修改；此前 Phases 0–4 的可用功能与 AI 凭据阻塞保持原状。

### 当前已验证内容与规划内容

| 学院           | 当前已有学习内容/能力                                    | 尚待规划或实现的范围                                                     |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| 编程           | 平台实验目录有三个真实 Python 微课（变量、循环、函数）   | 独立编程学习路径与统一课程图接入尚未实现                                 |
| 人工智能       | 学院目录与目标页面；平台共享 Mentor 网关/回退可用        | 学院课程、练习、测评与作品路径规划中；共享 Mentor 不代表 AI 学院课程完成 |
| 游戏开发       | 学院目录与目标页面                                       | 学院课程、练习、测评与作品路径规划中                                     |
| 计算机工程     | 平台实验目录有逻辑门模拟与真值表挑战                     | 学院课程编排与统一学习证据接入尚未实现                                   |
| 网站与云端     | 学院目录与目标页面                                       | API/云部署等课程与作品路径规划中                                         |
| 网络与安全     | 学院目录与目标页面                                       | 学院课程、练习、测评与作品路径规划中                                     |
| 机器人与物联网 | 学院目录与目标页面                                       | 学院课程、练习、测评与作品路径规划中                                     |
| 未来科技       | 学院目录与目标页面                                       | 学院课程、练习、测评与作品路径规划中                                     |
| 效率与自动化   | 平台实验目录有真实公式计算练习                           | 学院完整课程/任务路径与共同作品接入尚未实现                              |
| 开源学院       | M01 六课、检查题、分类测评/本机工作表；共享 Git 模拟可用 | M02–M12 课程尚未实现；首个模块不代表整学院已完成                         |

上表不重新分配现有实验所有权。Python、逻辑门、公式与 Git 是可复用能力，不能因为首先在某处展示就成为该学院的独占资源。上述“已验证”指历史技术/功能检查，内容尚未经过外部专家审核。

### UI V2 前已确认的架构差距（已修复项见文末）

- 十学院已有同级目录卡片，但首次引导仅列三个方向且默认开源；首页首个课时/续学以及推荐方向仍有固定选择，不满足新的中立策略。
- `apps/web/src/learning.tsx`、课程路由、进度统计与账号界面仍以开源六课为基准；`available` 学院级布尔值不足以表达各课程发布状态。
- 服务端进度 ID 校验、Mentor 课程上下文及无上下文回退仍直接引用开源列表。不能宣称所有学院已获得完整通用引擎接入。
- 实验框架、真实 Python、公式引擎和本机证据可用；共享课程注册表、依赖图、跨路径完成抵扣和统一项目模板/保存能力尚待实现。

原计划按 ROADMAP 的 A→B→C 推进；UI V2 已落实 A 和部分前端呈现切片，后续继续共享注册表/依赖图和兼容服务端进度迁移，再依据实际需求选择十学院的课程切片；不因开源实现较早继续默认优先。实时 AI 验证仍是可独立处理的凭据阻塞项，不阻塞本次架构方向。

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

Spreadsheet interpreter supports numeric literals, cell references, + - \* /, unary signs, parentheses, SUM/AVERAGE/MIN/MAX with same-column ranges or argument lists. It detects unknown references, unsupported functions, division by zero, cycles and bounded nesting. No eval or dynamic code execution. Budget challenge is checked against multiple input fixtures to reject hardcoded answers.

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

## GitHub main 与 Pages 发布准备

已核对初始工作区干净及既有六个开发提交。原环境不存在 `develop/nexus-academy`，因此从完整的 `development/phases-0-4` 创建该分支，原分支保留。已获取 `OsscarSon/nexus-lab` 远端 main，初次比较为开发成果的祖先；最终合并前仍需重新获取，使用保留历史的 merge 并正常推送，任何远端推进必须合并处理，不允许强推覆盖。

新增独立 `pages` 构建模式，Vite base 为 `/nexus-lab/`，使用 HashRouter 与按 base 定位的真实 Python worker/运行时。默认开发/完整应用仍使用 `/`、BrowserRouter 和原有 3001 API 代理。浏览器回归现在使用隔离的 3101 API 与临时数据库，保留正在运行的开发服务和用户数据。

静态版明确提示注册/登录、服务端进度同步、用量查询和生成式 AI 不可用；不显示账户提交表单、不调用 API，本机课程引导标注非生成式。原有数据键未修改，Pages 与本机来源不自动共享 localStorage。`.github/workflows/pages.yml` 在 main 推送/手动触发时检查、构建、运行静态浏览器测试，只发布前端 dist。Node 后端与服务端密钥不会作为 Pages 服务部署。

本轮已执行：`pnpm lint`、`pnpm typecheck`、`pnpm test`（41 项）、`pnpm build`、`pnpm test:e2e`（20 项桌面/移动回归）、`pnpm test:production`（1 项完整应用生产冒烟）、再次 `pnpm build:pages` 与 `pnpm test:pages`（4 项静态桌面/移动测试），全部通过。静态测试验证子路径导航/刷新、持久化记录、无后端请求、键盘跳转及真实 Python 输出。构建仅有既有 Zod 注解警告。

Gitleaks 使用经过官方发布校验和核验的版本扫描全部 8 个既有提交、最终待提交文件及 Pages 静态产物，三次扫描均未发现泄露。扫描工具和报告留在忽略的 .cache 中，不提交。GitHub API 读取曾返回 Forbidden，Git fetch 正常；不能据此假定 Git push 成功或失败。推送结果以真实 Git 操作及远端 SHA 为准。

Pages 代码和工作流准备就绪不代表线上部署成功。首次部署可能需要在仓库 Settings → Pages 将 Source 设为 GitHub Actions，并允许 Actions 与 github-pages 环境。只有远端工作流成功及站点验证后才能宣称部署完成；最终 Git 推送与站点验证状态见本次发布报告。

## UI V2 — 第一组模块检查点

开发分支 `develop/ui-v2`。延续原薄荷/深绿视觉，新增统一 SVG 图标、十学院无默认选择的引导、同级可搜索目录与实际内容筛选、统一目标/初阶/进阶/高阶概览及课程说明。首页移除固定开源起点，根据真实历史/原进度/所选方向续学；无记录时显示中立起点。作品卡片、详情和主动 JSON 导出读取原有工作表、Git/逻辑门、公式、Python 证据，不写回或迁移原数据。新增独立本机访问历史键 `nexus-ui-history`，访问不等于完成。

首组检查：typecheck、lint、47 项测试、生产构建、桌面/移动引导与七个代表页面 WCAG A/AA/无溢出检查通过。检查发现并修正了搜索框对比度与移动搜索图标可访问名称。课时/实验的响应式面板与完整回归仍在后续模块进行，不能将本检查点称为 UI V2 全部完成。详细设计见 UI_V2.md。

## UI/UX V2 — 已实现并完成本地验证

当前开发分支：`develop/ui-v2`。首个模块提交为 `b0c37f1`；后续工作区/课时模块保留在同一开发分支，不自动推送或部署到 main。

### 已完成

- 保留浅色薄荷、深绿、白色卡片与圆角留白；统一内联 SVG 图标、标题/状态标签、原生进度、轻阴影、焦点与微交互。设计细化独立于基础样式放在 `ui-v2.css`，无新增运行时依赖。
- 十学院完整同级引导，无预选学院；目录支持搜索与可用/规划内容筛选。所有学院复用目标、先修、初阶/进阶/高阶课程结构、状态说明和相关方向/练习入口；规划内容无假开始按钮，既有 Python/Git/逻辑门/公式为共享实践，不冒充完整学院课程。
- 首页提供基于真实目标/访问/完成证据的继续学习、简洁进度、最近实验和作品、中立的新用户起点及清楚的全部学院入口。旧 v1 完成记录没有 lastLesson/访问历史时也能续学；仅有 Python 成果时不会显示另一学院的零进度。
- 作品页从原工作表、Git/逻辑门、公式和 Python 成功证据生成卡片、筛选、详情及主动 JSON 导出；没有记录时显示空状态，记录缺失/格式异常不假设完成，也不删除原始数据。起步模板链接真实练习，未实现独立项目编辑器/云项目保存。
- 课时提供目标、短概念、实际互动示例、检查题/提示/反馈和下一课；桌面阅读与练习/结果并列，移动用学习/练习/结果标签。Git、逻辑门、Python、公式采用任务/操作/结果共同面板。切换保留挂载和输入；检查/reset/undo/运行均继续执行真实既有逻辑。
- Python 继续真实 Pyodide/worker 执行、按需加载、超时和停止；停止后返回可重新加载的操作区，输出标明实际执行输入。公式解释器继续报告真实计算、支持子集及错误。
- Mentor 紧凑展开，支持 Explain/Hint/Debug/Build、来源标识、清空与使用额度入口。无课时上下文时采用中立的非生成式教学内容，不再默认回答开源第一课；认证、预算、服务端 provider 与密钥边界未改。
- 移动五项导航保留 safe-area；正文/可聚焦操作预留底部滚动空间，标签支持方向键/Home/End，关键控件保持 44px 目标。默认浅色主题；无全屏编辑器、深色主题或重量级动画。

### 最终验证

- `pnpm lint`、`pnpm typecheck`：通过。
- `pnpm test`：48 项通过，含十学院结构、真实可用路由、旧数据只读兼容、证据验证和中立回退。
- `CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e`：32 项通过，含原 Phase 0–4 流程、十学院页面、真实 Pyodide 三个示例、公式/挑战/同步/AI 回退、作品导出、旧记录续学、面板状态/键盘导航、底部导航避让。
- 浏览器套件内的 WCAG A/AA 与无页面水平溢出检查覆盖 11 个代表页面，分别验证桌面和 Pixel 7 Chromium 模拟布局；另外有 360px、四倍 CPU 降速与未主动加载时无 wasm/zip 请求检查。模拟检查不等于真实 Android 硬件或完整人工辅助技术认证。
- `pnpm build` 与 `pnpm test:production`：通过，生产 CSP 下实际 Python 和非生成式帮助可用。构建仅有既有 Zod 注解警告。
- `pnpm build:pages` 与 `pnpm test:pages`：4 项桌面/移动测试通过，验证 `/nexus-lab/` 导航/刷新、学习记录、手机面板、无后端请求与真实 Python 资源。最后重新执行普通 `pnpm build`，将本机 dist 恢复为完整应用模式。
- 生成并审阅 `.cache/ui-v2/` 桌面/手机首页、学院、课时、实验及作品截图；截图与浏览器测试记录未提交为应用用户数据。

本轮发现并修复了搜索对比度、图标链接名称、旧课程进度条 ARIA、Python 停止返回面板及没有新历史的旧用户续学问题。浏览器测试等待目标面板挂载，不用强制点击或禁用断言规避手机异步路由。

### 保留的边界

没有更改旧内容 ID、路由、localStorage 键或 SQLite 格式，没有迁移/清空用户数据。新增 `nexus-ui-history` 仅保存至多 12 条实际访问；访问不算完成。账户课程同步与非生成式帮助/平台 AI 的原有限制不变；Pages 仍明确不提供后台账户/同步/生成式 AI。当前改动未推送，不能宣称线上 UI 已更新。

完整跨学院课程依赖图、通用后端课时注册/新进度格式、十学院完整课程、云作品编辑器、深色模式和真实设备验收仍是后续工作。实时 AI 仍因没有有效服务端 provider 配置而未验证。下一步应继续共享课程图与证据兼容工作，不因首个课程实现较早而优先某学院。

## Phase 5A — 十学院中立发现

按 GitHub Issue #1 与最新 ROADMAP 实施新的 Phase 5，历史 Open Source Explorer 定义不适用。从最新 origin/main 创建 feature/phase5-curriculum，并合入已验证 UI V2 两个提交，未改 main。十学院同级入口/全量引导/中立首页保留；呈现模型补齐 available / in-development / planned 三种发布状态，发布可用性与学习者完成记录分开，未发布项目不生成假开始操作。5B/5C/5D 尚待后续提交。GitHub API 暂因 Forbidden 阻塞 PR 创建；Git 与 Issue 网页可读，已保存仅增加 api.github.com 的网络草案，尚未应用。

5A 验证：lint、typecheck、49 项 unit/API 测试、生产构建、14 项桌面/移动中立入口与 UI V2 回归通过。新增发布状态时发现旧测试仅区分两态的类型假设，已改为明确以 available 判断可执行路由并重新通过 typecheck/build。

## Phase 5B — 共享课程注册表与依赖图

新增 Zod 校验的 Academy、Topic、LearningPath、Course、Module、Lesson、Assessment、ProjectTemplate、Lab 和带确切版本的 ContentRef；内容身份为 kind/id，旧六课 os-\* ID 与 M01 路由别名保持。新内容仅以引用复用。注册表拒绝重复 ID、悬空引用、错版本、required/recommended 循环（包括容器展开边）、空已发布课程以及不可完成的已发布硬依赖。related 链接不锁课，先修查询返回原因和已有证据满足情况；路径需求去重。

5B 验证：typecheck、lint、60 项测试及生产构建通过。11 项图/模式测试覆盖失效条件与去重。本提交尚未替换运行时学习页面或迁移学习记录；5C 接入通用体验与兼容存储后，5D 再发布十学院新切片。

## Phase 5C — 通用体验、证据与兼容同步

所有原课时/课程现在通过注册表查询与通用渲染器；仓库示例改为注册互动块而非 lessonId 特判。互动量规与测验共同生成版本化证据；路径按唯一内容身份计数，硬先修未满足不授予进度。已有工作表/Git/逻辑门/公式/Python 成果导入为可验证的实验/项目证据，原记录不改写。课程作品按自己的完成引用聚合，不用共享基础课冒充独立项目。

新增独立本机 nexus-curriculum-progress v2 键及一次性原始字节备份；旧 v1、异常 JSON、未知 ID、旧版本记录不会被静默删除，不猜测未知历史时间。存储失败不覆盖原数据。SQLite 在事务内保存 v2，并将原数据完整保留到 progress_backups；旧 /api/progress 继续支持原六课，新 /api/progress/v2 对证明重新执行同一内容量规并保留账号隔离。删除账号同时删除学习备份，匿名费用账本不变。新增只读课程目录/课程/课时 API；Mentor 查询相同的已发布课程上下文，认证/配额/平台密钥边界未放宽。

5C 验证：lint、typecheck、69 项测试、原有 32 项桌面/移动浏览器回归、production/Pages 构建、4 项静态 Pages 检查通过。测试覆盖备份、异常记录、旧协议/新协议、拒绝错版本/错误量规、共享去重和硬先修。一次幂等测试初版误比较新 JSON 字段顺序，已改为结构相等；原始旧数据仍按字节验证。十学院新课时尚在下一阶段发布，不能据本检查点宣称十套课程已上线。

## Phase 5D — 十学院真实入门模块与最终回归

Phase 5A、5B、5C、5D 本轮开发范围已实现，待 PR 审查；不表示十套完整课程或线上部署完成。当前分支 feature/phase5-curriculum 含原 UI V2 历史及四阶段提交，main 保持不动。课程内容清单见 CONTENT_INVENTORY.md。

- 十学院分别发布：Python 变量与表达式、提示结构与结果验证、游戏规则与计分、AND 与真值表、HTTP 请求入门、最小权限入门、传感/阈值/控制、预测/模型/实测、预算公式与数据接口、源码可见与许可判断。14 个新唯一课时以 18 个位置被十条路径引用，每院一个模块/课程/项目模板；旧 M01 六课和工作表继续可用。
- 每课有华文目标、讲解、实例、可操作练习、自动量规、测验解释、完成记录与下一课建议。新课必须互动和测验同时通过；旧六课保持原完成语义。API、Git、证据辨析共享课时只存一份，完成抵扣按规范身份去重；项目需要各自独立课程要求。
- Python 练习直接调用真实现有 Pyodide；程序从同一 canonical source 构建给 worker，避免维护两份程序。公式用真实解释器校验三组数据。Git/逻辑门仍明确为模拟；HTTP/传感/游戏是可检查状态模型，AI 提示为非生成式规则检查，不冒充外部服务或硬件。
- 通用课程/课时/独立测评支持同一注册表；独立测评只能授予自身证据。补齐不可测评先修、无解互动、Python 期望输出验证；学习界面懒加载，重运行时继续按需加载。原始本机键/SQLite 行先备份，未知/损坏/旧版本证据保留待解析，不删除学习数据。

### 最终验证（2026-11-12）

- pnpm lint、pnpm typecheck：通过。
- pnpm test：10 个文件，84 项 unit/API 测试全部通过。
- CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e：38 项全部通过，桌面和 Pixel 7 模拟环境实际完成十课程的互动/测验/项目与跨路径去重；保留原课程、账户同步、实验、UI V2、无障碍和小屏降速回归。
- pnpm build + pnpm test:production：构建与 1 项生产 CSP 冒烟通过，真实 Python 与诚实回退可用。
- pnpm build:pages + pnpm test:pages：构建与 6 项桌面/手机测试通过，验证子路径刷新、旧记录、真实 Python、新学院课程与跨路径抵扣，且无后端请求。
- Zod 的既有 Rollup 注解提示仍存在，不影响构建。早期测试发现的旧路由/规划状态假设及 JSON 字段顺序比较已修正测试后回归通过；最终没有失败或跳过的测试。

当前未观察到原有功能回归；自动化与模拟设备不等同真实 Android/完整人工辅助技术验收。内容尚需独立学科评审，进阶/高阶、独立云项目编辑/同步、真实设备连接、任意 Python 编辑器、GitHub Explorer 为后续范围。无有效服务器 provider 凭据，实时 AI 仍未验证；非生成式帮助可用，无学生 API key 要求。

最后 fetch 的 origin/main 为 fb28a6f5f3a6949ac7408489ca7bd56e7c607d83，已包含于开发分支历史。Git fetch 可用，GitHub API 仍返回 Forbidden；PR 与推送结果以最后发布记录为准。网络草案尚不能视为已应用配置，不宣称已创建 PR 或部署成功。

最终安全检查：Gitleaks 对全部 14 个既有提交、待提交索引快照及最终完整应用产物进行脱敏扫描，均未发现泄露。Pages 验证后重新执行普通 pnpm build 成功，本机 dist 恢复完整应用模式；扫描工具/报告与构建产物均不提交。
