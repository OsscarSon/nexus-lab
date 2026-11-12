# Technical Architecture v1

## Stack recommendation
pnpm workspace monorepo; TypeScript; React + Vite for lightweight PWA MVP, React Router, TanStack Query, Tailwind or CSS variables (choose one styling approach), Zod input schemas, Vitest + Testing Library, Playwright smoke E2E. Server API: Cloudflare Workers (Hono optional) OR conventional Node server, select one based on deployment constraints. Database: managed PostgreSQL for users/progress/project metadata when needed; anonymous/local onboarding stored locally before account creation. Storage: object store for user projects. Avoid microservices in MVP. Server-side OpenAI-compatible provider adapters must be modular and vendor-neutral.

## Monorepo
apps/web; apps/api; packages/ui; packages/core; packages/content-schema; packages/lesson-engine; packages/lab-contracts; packages/ai-gateway; packages/integrations; content/academy-{10 slugs}; docs; tests.

## Key domain entities
User(id, locale, settings); Academy(id, slug, title); Course(id, academyId, level, status); Module(id, courseId, order); Lesson(id, moduleId, contentVersion); Enrollment(userId, courseId); LessonProgress(userId, lessonId, mastery, lastActiveAt); Lab(id, runtimeKind, deviceRequirement); LabAttempt(id, userId, labId, evidence, result); Project(id, ownerId, visibility, templateId); ProjectVersion(id, projectId, commitRef); MentorConversation(id, userId, lessonId); AIUsage(id, userId, provider, tokensIn, tokensOut, billedEstimate); IntegrationConnection(id, userId, provider, scopes, encryptedCredentialsRef).

## Architecture boundaries
UI depends on domain contracts, never on concrete AI or GitHub SDK. Lab engine is plugin-based: lesson references `labId`; runtime adapter owns capability check, run, reset, evaluate. Integrations execute only server-side with explicit OAuth scopes and consent. Separate tutorial mock/simulated actions from real APIs. Treat external repositories, web pages, imported files, and AI outputs as untrusted data. Do not inject untrusted HTML. Restrict file and network access for executable code.

## Routes / endpoints
GET `/api/catalog`; GET `/api/course/:id`; GET `/api/lesson/:id`; POST `/api/progress`; POST `/api/lab/attempt`; POST `/api/mentor/chat` (authenticated + quota); GET `/api/mentor/usage`; GET `/api/opensource/repository?owner=&repo=` (public metadata rate limited; allowlist/safe URL parsing); POST `/api/projects`; GET `/api/projects`; POST `/api/integrations/google/connect` (OAuth initiation); POST `/api/integrations/google/disconnect`.

## Isolation
Frontend JS sandbox: iframe sandbox with CSP, restricted origin, resource budgets. Python via Pyodide worker for curated examples; no fake arbitrary Python support. Remote execution for other languages only in hardened isolated services with caps, or marked unavailable. Never execute arbitrary GitHub repos in the API worker. Local device model feature detected and opt-in. Secret scanning and branch protection before public launch.

## Data and auth
Anonymous try-first experience; account optional until syncing projects; OAuth/credential flows isolated. Per-user access enforcement server-side (not only front-end), least privilege, audit log for external writes. Save user data only as needed; export/delete paths. No plaintext API keys stored; server secrets or encryption-backed vault. RBAC: learner, author, admin.

## Course content pipeline
Stable content IDs. MDX (curated/sanitized and built at compile time) or structured JSON; ensure no arbitrary user-defined JSX. Schema check before publishing. Localization by message IDs with English terms preserved alongside Chinese explanation. Content authored/reviewed versioned; evidence that labs validate learning objectives.

## PWA
Static assets and reading materials cached; never cache sensitive API responses or auth tokens. Offline lab flags per runtime. Desktop has advanced split-view; mobile uses single pane. Low-powered device detect WebGPU rather than assuming.

## CI and quality gates
pnpm lint; pnpm typecheck; pnpm test; pnpm build; pnpm test:e2e smoke. Dependency auditing, accessibility automated checks, and manual mobile QA. PR rules: no secrets, no unrelated file edits, lockfile updates reviewed, responsive screenshots for UI changes, source attribution for open-source reused content.

## Milestone definition of done
Working path demonstrated; empty/loading/error/offline states; mobile basic usability; accessible keyboard controls; typed contracts, tests for changed behavior, docs updated, no console errors, Git commit and concise status report.
