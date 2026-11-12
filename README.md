# NEXUS LAB

Chinese-first interactive technology academy. All ten academies are equally important and share one learning platform; Open Source M01 is the first implementation example, not a central academy. UI V2 provides academy-neutral presentation and shared practice entry points. Phase 5 adds a validated shared curriculum graph, generic lessons, backward-compatible progress migration, and ten real beginner modules. See the [published content inventory](docs/CONTENT_INVENTORY.md). See [product principles](docs/PRODUCT_SPEC.md), [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md) and [current implementation status](docs/CURRENT_STATUS.md).

## Development

Node 24 and pnpm 11.25.0 are validated. In managed cloud shells:

```sh
export XDG_DATA_HOME=/workspace/.local/share
export XDG_CACHE_HOME=/workspace/.cache
export NPM_CONFIG_CACHE=/workspace/.cache/npm
cd /workspace/nexus-lab
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e
```

On other machines, omit `CHROMIUM_PATH` after installing Playwright Chromium with `pnpm exec playwright install chromium`.

Routes: `/` landing, `/welcome` goal selection, `/home`, `/learn`, `/learn/:academy`, `/lab`, `/projects`, `/me`. Unsupported routes show a recovery page. Ten beginner modules are available; intermediate and advanced curricula remain explicitly planned. Data is stored locally; no account or secret is needed.

Dependencies: React for rendering, React Router for navigation, Zod for content validation. Vite/TypeScript provide strict compilation, ESLint static checks, Vitest domain tests, and Playwright desktop/mobile functional checks. CSS tokens implement the shared visual system without a styling framework.

See `docs/CURRENT_STATUS.md` for verified scope and limitations. Product specifications remain the source of truth; unimplemented later phases are not presented as working features.

## Open Source M01

Start at `/learn/opensource/foundations`. Six lessons at `/lesson/:lessonId` contain real authored explanations and quizzes. Correct answers persist progress locally. `/learn/opensource/assessment` creates a license-classification worksheet shown in Projects. Lessons can be revisited freely. Legacy source material remains in `content/opensource.ts`; the runtime registry is assembled in `content/curriculum.ts` and validated with Zod. Nothing connects to or executes an external repository.

## Interactive labs

`/lab/git`: create a feature branch, edit README to contain `Hello open source`, stage, commit, and check. Staging captures a snapshot; later edits are not silently committed. `/lab/logic`: select AND/OR/XOR/NOT, toggle inputs, predict the truth table and check. Both support undo/reset and save successful evidence locally. These are labeled simulations, never real Git or hardware execution.

## Python and formulas

`/lab/python` lazy-loads a real pinned Pyodide runtime from same-origin assets (~12 MB, copied by dev/build). It runs three curated Python programs in a worker; inputs are integers 0–1000. Loading times out after 45 seconds, execution after 5 seconds; Stop terminates the worker. No arbitrary Python imports, remote packages or server code execution are exposed.

`/lab/spreadsheet` evaluates numeric cells, arithmetic, parentheses and SUM/AVERAGE/MIN/MAX with same-column ranges or comma arguments. Errors are explicit. This is a defined teaching subset, not Excel compatibility. Heavy views are code-split. Retain the entire `dist/` directory, including `vendor/pyodide`, when deploying.

## Optional accounts and Mentor

Start `pnpm dev:api` in a second terminal for accounts, progress synchronization and the Mentor API. `/me` supports username/password accounts, explicit progress merging, logout and account deletion. `/settings/ai` reports actual server enablement and usage. Lessons and Git/logic labs provide contextual Explain, Hint, Debug and Build assistance.

Default behavior is explicitly labeled, non-generative course assistance. No learner key is needed. The server-only OpenAI-compatible adapter has durable per-user and global quotas, conservative cost reservations, timeout/response bounds and fail-closed billing reconciliation. Live AI has **not** been verified: provider credentials and configuration are absent. BYOK is disabled.

For a built application, run `pnpm build` then `pnpm start`. Full environment variables, account data/privacy boundaries, deployment prerequisites, demo steps and the AI credential blocker are documented in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md). Run `CHROMIUM_PATH=/usr/bin/chromium pnpm test:production` to smoke-test the compiled app and same-origin Python under CSP. GitHub Actions is configured; remote CI and public deployment have not been run.

## GitHub Pages（仅前端）

`pnpm build:pages` 为 `/nexus-lab/` 生成静态前端，使用 Hash 路由，例如 `/nexus-lab/#/learn`；刷新课时页面无需服务器重写规则。`pnpm dev` 和 `pnpm build` 仍使用根路径与原有 BrowserRouter。运行 `pnpm build` 可将 `dist/` 切回本地完整应用构建；两种构建会替换同一个输出目录。

`.github/workflows/pages.yml` 在 `main` 推送或手动触发时检查、构建并验证 Pages 版本，只上传 `dist/`，通过官方 Pages Actions 部署；不会部署 Node.js 后端、数据库或服务器密钥。仓库需在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，并允许工作流及 `github-pages` 环境部署。实际线上状态以工作流和网站验证为准。

静态版保留本机课程进度、Git/逻辑门/公式实验和真实浏览器 Python。注册、登录、服务器进度同步、服务器额度查询及生成式 AI 不可用，界面明确标注且不会发送 API 请求；课程引导为本机非生成式内容。既有 localStorage 键不变，但 GitHub Pages 与本机服务器是不同来源，浏览器不会自动搬迁来源之间的数据。

静态构建验证：`pnpm build:pages`，然后 `CHROMIUM_PATH=/usr/bin/chromium pnpm test:pages`。该测试只启动静态预览，不启动后端，覆盖桌面/移动端子路径、刷新、学习记录、课程帮助和真实 Python 资源加载。后端浏览器回归使用隔离的 3101 端口与临时数据库，不接触正在运行的 3001 开发服务。默认开发代理仍为 3001；测试可通过 `NEXUS_DEV_API_TARGET` 显式指定其他目标。

## UI/UX V2

延续薄荷绿与深绿视觉，新增统一 SVG 图标、真实学习首页、十学院同级目录与完整引导、统一学院目标/分级规划/课程说明、作品卡片/详情/证据导出，以及课时和实验的手机标签面板。没有学习记录时不默认导向某个学院；原有完成记录与练习成果可直接读取，无需清空或迁移。

新增路由：`/learn/:academy/curriculum/:courseId` 查看实际课程或规划说明，`/projects/:projectId` 查看本机学习证据。已有所有课程、测评和实验 URL 保留。项目模板链接到真实练习；独立项目编辑器与云项目存储尚未实现。发布状态和学习者完成状态分别显示。

`content/experience.ts` 管理学院展示与共享练习引用；`apps/web/src/activity.ts` 兼容读取原有证据并用独立 `nexus-ui-history` 键保存最近访问；访问不算完成。`components/ui.tsx` 提供保留状态的响应式面板和原生进度组件；`ui-v2.css` 为独立的设计细化层。没有新增运行时依赖。

Python 继续按需加载，页面切换标签不会销毁 worker；停止操作会终止运行时并返回操作区。Mentor 清楚标明 AI 或非生成式内容，无课时上下文时提供通用学习帮助。账户/API/Pages 限制保持原有安全边界。

设计与验证范围见 [docs/UI_V2.md](docs/UI_V2.md)。桌面/移动浏览器回归包含真实 Python、原有 Phase 0–4 流程、旧数据兼容、十学院入口、作品导出、360px/4倍 CPU 降速检查、标签键盘操作与安全区域。降速与 Pixel 7 浏览器模拟不等于真实 Android 设备验收；深色主题本轮未实现。
