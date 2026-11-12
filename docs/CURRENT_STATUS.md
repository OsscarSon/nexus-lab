# Current status

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
