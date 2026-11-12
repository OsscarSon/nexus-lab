# Codex Implementation Roadmap

## Phase 0 — Repo and UX foundation
Set up monorepo, TS strict, React/Vite, router, CSS tokens, five-item nav, reusable layout and error boundary. Seed ten academy catalog entries from fixtures, landing/onboarding/home/learn shells. Real responsive behavior. Completion: navigation and first-time user flow work in desktop/mobile widths; no dead primary CTA.

## Phase 1 — Open Source foundations vertical slice
Deliver M01 five lessons, lesson renderer, progress locally, hint panel with authored explanations, GitHub concepts micro-simulator and end-of-unit quiz. Course data in schema-validated files. Completion: learner finishes course start-to-end, persists locally on refresh, without signup/API key.

## Phase 2 — Labs foundation
Standard lab adapter contract; Logic Gate lab and Git staging simulator; reset, run/check, solution hints, accessible controls. Completion: rubric tests and an end-to-end lab path.

## Phase 3 — Python / Workspace sample
Curated Pyodide worker examples with support detection and bounded execution. Spreadsheet formula practice with a clearly labeled limited teaching interpreter, not fake Excel. Completion: actual sample code runs in supportable browser; formula validates given sample and reports unsupported expressions.

## Phase 4 — Optional account and AI Mentor
Introduce auth/progress sync, basic fallback help, server-side rate-limited AI gateway, provider adapter, usage meters and budget stops. Completion: new user needs no key; platform API key never reaches client; quota exhaustion gracefully falls back.

## Phase 5 — Open Source Explorer
GitHub public metadata, file tree and README with rate limiting, no repo execution. License status explicitly unknown if absent. Completion: user enters repo URL and sees validated data, errors and safe warnings.

## Phase 6 — Projects and Workspace
Project templates, private save/export, Workspace simulated mission. Google OAuth later, only after permission/security review. Completion: user can produce a tangible artifact and export it.

## Phase 7+ — remaining academies
Add module by module with lessons, at least one meaningful lab, assessments and device-specific alternatives. Release curriculum coverage only when content reviewed.

## Definition of done per task
Type-safe and tested; functional UI; mobile + keyboard support; verified loading and error state; course data maintained; status docs updated; Git commit; screenshots or reproducible test steps.
