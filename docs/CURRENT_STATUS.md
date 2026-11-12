# Current status

Phases 0–3 are implemented and verified. Phase 4 account/sync, gateway controls and non-generative assistance are implemented and verified locally; live AI provider validation is blocked by absent server credentials/configuration. No public deployment, remote CI run or environment publication has been verified. Development branch: `development/phases-0-4`; stable branches have not been overwritten.

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

Deferred limitations: no BYOK/local generative model, streaming, password recovery/MFA, cloud lab artifact sync, multi-instance distributed ledger, full Excel, arbitrary Python execution, PWA offline installation or externally reviewed curriculum. Optional accounts run on this backend, not a deployed managed identity service. The next safe task is deployment-specific account/privacy hardening or the credentialed live-provider smoke test; Phases 5+ have not started. See `docs/ENVIRONMENT.md` for reproducible startup, data retention, quotas, proxy settings and deployment boundaries.
