# AI Mentor Architecture — No API Key Required for Learners

## Product rules
1. Beginner does not see API key setup. Basic course hints work without paid inference.
2. Default generative model is called via server-side AI gateway with platform-owned secret; never send secret to browser.
3. Optional bring-your-own-key (BYOK) is explicit advanced setting, disabled by default. Keys must be encrypted at rest with managed keys, masked, revocable, never in logs, never in exported profiles; consider avoiding stored BYOK in v1 by per-session server-side credential design.
4. Optional on-device model is feature-detected (WebGPU + storage + performance) and opt-in; show download size and limitations. Not universally supported on phones.
5. Free usage limits are per account, per IP/device risk signal, and global budget; count token consumption, apply rate limiting, concurrency caps and maximum response size. Publish limits honestly; no unlimited-free promise.
6. Give honest fallback: course FAQ, static hints, error catalog and retrieval search when AI quota is exhausted or disabled. Never brand rules-based help as generative AI.

## Flow
Web UI → authenticated `/api/mentor/chat` → input validation → course context allowlist → policy checks → quota reservation → provider adapter → streaming answer → usage reconciliation and safe telemetry.

## Interfaces
`MentorMode = 'explain' | 'hint' | 'debug' | 'build'`
`ProviderKind = 'platform' | 'local' | 'byok' | 'fallback'`
`MentorRequest = {conversationId?, mode, lessonId?, labId?, userMessage, selectedCode?, selectedText?}`
`MentorResponse = {answer, providerKind, quotaRemaining?, references?, actionableNextSteps?, isSimulation}`
Provider interface supports `chat`, `health`, `capabilities`, `estimateCost`, `cancel`.

## Lesson context
Retrieve only user-authorized course snippets (title, objectives, current lesson, lab instructions), and selected code. Strip secrets from submitted code and redact telemetry. Prompt injection from imported repositories or retrieved text is treated as untrusted. No unrestricted filesystem/shell/network actions through Mentor.

## Teaching policy
Explain: concrete analogy first, then accurate technical definition.
Hint: give one hint at a time; reveal full answer only after explicit request.
Debug: identify likely cause with uncertainty; ask for error details if missing; never claim code was executed unless it actually was.
Build: break work into milestones and tests; tool execution requires user confirmation and sandbox.

## Safety, cost and operations
Server secrets stored in provider secrets manager; rotate periodically. Budget alert thresholds at 50/80/100%; at cap, disable paid inference and route to fallback. Disallow anonymous unrestricted usage. Basic content remains usable without login. Limit prompt size and attachments. Keep retention user-controlled and documented. Rate limit endpoint and protect against automated abuse. Log metering without full prompt content by default. Never assume third-party providers are free forever.

## Suggested first release
Fallback assistant for complete lessons + one platform-hosted model adapter + minimal monthly cap in configuration; BYOK and browser-local AI deferred behind flags. UI always shows whether answer came from AI or guided lesson content.
