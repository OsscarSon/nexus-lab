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

## 长期开发与安全同步规则（产品负责人已授权）

- 开发前 fetch 最新 origin/main，检查工作区和分支差异；保护未提交文件与本地提交。使用当前隔离 checkout，不自动创建 worktree。
- 以小型、可审查的 Git commit 保存阶段成果。完成开发并通过必要验证后，默认直接安全同步到 GitHub main，无需重复请求许可。
- 推送前运行 typecheck、lint、unit tests、browser tests、production build、Pages build 及对应 smoke checks；检查 diff、追踪文件和构建产物中的密钥或敏感资料。
- 推送前再次 fetch main，只允许正常 merge 或 fast-forward。禁止 force push、重写历史、丢弃远程新提交或删除已有工作。
- 出现冲突、失败测试或仓库权限问题，停止同步并说明原因；保留成果供修复，不绕过检查。
- 推送成功后核对远程 commit 和 Pages 部署结果。提交、推送、Actions 成功、公开网站更新分别报告；无法验证时写明未知。
- 课程发布需通过 Curriculum Quality Checklist：六项各 0–5，总分至少 25/30 且每项至少 4/5。没有证据不得打分或标为正式发布；保留 Draft / In Development。
