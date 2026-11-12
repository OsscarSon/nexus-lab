# NEXUS LAB

Chinese-first interactive technology academy. All ten academies are equally important and share one learning platform; Open Source M01 is the first implementation example, not a central academy. The proposed shared curriculum graph and neutral-engine migration are documented, not yet implemented. See [product principles](docs/PRODUCT_SPEC.md), [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md) and [current implementation status](docs/CURRENT_STATUS.md).

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

Routes: `/` landing, `/welcome` goal selection, `/home`, `/learn`, `/learn/:academy`, `/lab`, `/projects`, `/me`. Unsupported routes show a recovery page. Academy curricula are explicitly marked as planned until implemented. Data is stored locally; no account or secret is needed.

Dependencies: React for rendering, React Router for navigation, Zod for content validation. Vite/TypeScript provide strict compilation, ESLint static checks, Vitest domain tests, and Playwright desktop/mobile functional checks. CSS tokens implement the shared visual system without a styling framework.

See `docs/CURRENT_STATUS.md` for verified scope and limitations. Product specifications remain the source of truth; unimplemented later phases are not presented as working features.

## Open Source M01

Start at `/learn/opensource/foundations`. Six lessons at `/lesson/:lessonId` contain real authored explanations and quizzes. Correct answers persist progress locally. `/learn/opensource/assessment` creates a license-classification worksheet shown in Projects. Lessons can be revisited freely. Content lives in `content/opensource.ts` and is validated with Zod. Nothing connects to or executes an external repository.

## Interactive labs

`/lab/git`: create a feature branch, edit README to contain `Hello open source`, stage, commit, and check. Staging captures a snapshot; later edits are not silently committed. `/lab/logic`: select AND/OR/XOR/NOT, toggle inputs, predict the truth table and check. Both support undo/reset and save successful evidence locally. These are labeled simulations, never real Git or hardware execution.

## Python and formulas

`/lab/python` lazy-loads a real pinned Pyodide runtime from same-origin assets (~12 MB, copied by dev/build). It runs three curated Python programs in a worker; inputs are integers 0–1000. Loading times out after 45 seconds, execution after 5 seconds; Stop terminates the worker. No arbitrary Python imports, remote packages or server code execution are exposed.

`/lab/spreadsheet` evaluates numeric cells, arithmetic, parentheses and SUM/AVERAGE/MIN/MAX with same-column ranges or comma arguments. Errors are explicit. This is a defined teaching subset, not Excel compatibility. Heavy views are code-split. Retain the entire `dist/` directory, including `vendor/pyodide`, when deploying.

## Optional accounts and Mentor

Start `pnpm dev:api` in a second terminal for accounts, progress synchronization and the Mentor API. `/me` supports username/password accounts, explicit progress merging, logout and account deletion. `/settings/ai` reports actual server enablement and usage. Lessons and Git/logic labs provide contextual Explain, Hint, Debug and Build assistance.

Default behavior is explicitly labeled, non-generative course assistance. No learner key is needed. The server-only OpenAI-compatible adapter has durable per-user and global quotas, conservative cost reservations, timeout/response bounds and fail-closed billing reconciliation. Live AI has **not** been verified: provider credentials and configuration are absent. BYOK is disabled.

For a built application, run `pnpm build` then `pnpm start`. Full environment variables, account data/privacy boundaries, deployment prerequisites, demo steps and the AI credential blocker are documented in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md). Run `CHROMIUM_PATH=/usr/bin/chromium pnpm test:production` to smoke-test the compiled app and same-origin Python under CSP. GitHub Actions is configured; remote CI and public deployment have not been run.
