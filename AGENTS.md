# Codex Working Rules — NEXUS LAB

Read `README.md` and `docs/` before implementation. `docs/PRODUCT_SPEC.md`, `docs/UI_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/AI_MENTOR.md`, `docs/OPEN_SOURCE_ACADEMY.md` and `docs/ROADMAP.md` are the product source of truth. Implement incrementally.

- Treat all ten academies equally in navigation, visual hierarchy and shared-engine access. Open Source M01 is the initial implementation example, not a central academy. Reuse canonical curriculum content by stable references; preserve existing IDs and learning data. Use docs/ROADMAP.md for future priorities and distinguish planned content from available content and learner completion.
- Maintain the five primary nav destinations: Home, Learn, Lab, Projects, Me.
- Default UI is clean, bright, calm, responsive, Chinese-first. Do not cram all 10 academies into Home.
- Do not require student API keys. Keep provider secrets server-only. Never fabricate AI messages as live responses.
- Do not call simulated labs real executions. No arbitrary repo or user-code execution on the API server.
- Do not add paid services or dangerous integrations without explicit approval. Keep optional integrations behind feature flags.
- Keep course content separate from components and typed with schema validation.
- Avoid unrelated changes. Preserve working modules when adding a feature. Limit dependencies and explain why each major dependency is needed.
- Every change requires typecheck, lint, tests and build when available; report executed commands, pass/fail, and unresolved issues accurately.
- Keep `docs/CURRENT_STATUS.md` updated with completed scope, pending work, known issues and the next safe task.
- Create small, reviewable Git commits; never force push or delete uncommitted work.
