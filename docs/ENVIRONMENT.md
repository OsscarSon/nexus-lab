# Development and deployment runbook

## Local / managed cloud

Validated: Node 24.22.1, npm 11.9.0, pnpm 11.25.0, Linux Chromium. Node 24 is required for built-in SQLite and environment-proxy support. Work on a development branch; keep stable branches for review. Existing task checkouts are isolated; no Git worktree is needed unless explicitly requested.

```sh
export XDG_DATA_HOME=/workspace/.local/share
export XDG_CACHE_HOME=/workspace/.cache
export NPM_CONFIG_CACHE=/workspace/.cache/npm
cd /workspace/nexus-lab
pnpm install --frozen-lockfile
pnpm build
```

Start two processes from the repository:

```sh
pnpm dev:api
# in another terminal
pnpm dev
```

Vite uses port 5173 and forwards `/api` to the backend on 3001. Use a local HTTP request to validate startup: `curl --fail http://127.0.0.1:3001/api/health`. Expect `ok: true`, `aiEnabled: false` by default. The web app must serve its landing page and `/learn` route. No external database, OAuth service or AI key is required for the default workflow.

`pnpm build && pnpm start` serves the compiled SPA, all Python assets and API on port 3001. Set `NODE_ENV=production`, `NEXUS_APP_ORIGIN=https://your-real-origin` and terminate HTTPS at a trusted reverse proxy before using real accounts. Production sessions set Secure cookies, so production account tests require HTTPS. The production browser smoke test uses HTTP only for public courses, Python and anonymous fallback. It does not validate a public TLS deployment.

Backend defaults to loopback. Set `NEXUS_BIND` only when the deployment needs a different interface. Set `PORT` to change the backend port; update Vite's proxy if changing it in development. Preserve the inherited proxy/CA environment. The server uses Node's `--use-env-proxy`; do not disable TLS verification. Startup doesn't automatically load `.env`; use platform variable injection or Node's explicit `--env-file` with a private file outside Git. See `.env.example` for variable names, without secrets.

## Persistent state and account scope

SQLite defaults to ignored `.cache/nexus.sqlite`. Set `NEXUS_DB_PATH` to a durable private volume for deployed use and back it up using SQLite's supported online backup tools. The startup process uses a restrictive umask. The database stores salted scrypt password hashes, SHA-256 session token hashes, versioned course completion records, rate buckets and quota metadata. Session cookies are HttpOnly/SameSite=Strict, expire in seven days, and are revoked on logout or account deletion. Requests check origin and a custom header; no cross-origin credentialed CORS is enabled. Request size is capped at 12 KB. Basic HTTP limits, auth limits, request deadlines and a connection cap are enabled.

Accounts are optional. Username/password registration, login, manual merge of course progress, logout and account deletion are implemented. There is no email collection, password recovery, MFA, admin UI or multi-instance distributed account service. These omissions must be resolved as appropriate before a broad public launch. No externally audited security certification is implied. Server progress represents learner completion, not a tamper-proof credential.

Account deletion removes sessions/progress and replaces credentials/username with inaccessible random tombstones. Anonymous quota ledgers remain to prevent account deletion from refunding platform costs. No full prompts or generated answers are stored in the database or logs. Local browser records remain when logging out/deleting accounts, as disclosed in the UI. Clear browser site data to remove local records. Shared-device users must consciously choose whether to merge local progress into an account.

IP risk keys are hashed from the actual socket address. Arbitrary forwarded headers are deliberately not trusted. Behind a proxy, this applies a conservative shared limit until trusted-proxy handling is designed for that deployment. It cannot be bypassed by supplying a forged X-Forwarded-For header.

## AI configuration and exact external blocker

Live generation has **not been verified**. `NEXUS_AI_API_KEY`, a model, endpoint, token prices and explicit enablement are not configured. No live request has been billed or sent to a provider. The default assistant uses authored course explanations, one-step hints, a debugging checklist and a build checklist; it identifies itself as non-generative. It is not a semantic answer to an arbitrary question.

To enable live generation later, securely configure server-only `NEXUS_AI_API_KEY`, `NEXUS_AI_MODEL`, a trusted `NEXUS_AI_ENDPOINT` (for example `https://api.openai.com/v1/chat/completions`) and both positive `NEXUS_AI_INPUT_MICROUSD_PER_MILLION` / `NEXUS_AI_OUTPUT_MICROUSD_PER_MILLION` prices, then set `NEXUS_AI_ENABLED=true` and restart. Verify current model compatibility and pricing with the selected provider. The endpoint must accept the OpenAI-compatible chat-completions contract, `max_tokens` and prompt/completion usage reporting. HTTPS is mandatory and redirects are rejected. Missing required configuration causes startup to fail rather than quietly claiming that AI is live.

Allow the exact provider hostname in the cloud environment's outbound settings if needed. Enter keys only in the platform's secure settings, never in chat, client-prefixed variables or committed files. Proxy-backed key placeholders must be bound to the selected HTTPS destination. A valid configuration still needs an authenticated, metered live smoke test before calling the integration verified. `.env.example` is documentation, not an automatically loaded secret file.

Limits are configurable with nonnegative integer variables:

| Setting | Default |
| --- | --- |
| `NEXUS_AI_REQUESTS_PER_MINUTE` | 5 per account |
| `NEXUS_AI_DAILY_TOKENS` | 20,000 |
| `NEXUS_AI_USER_MONTHLY_MICROUSD` | 1,000,000 ($1) |
| `NEXUS_AI_GLOBAL_MONTHLY_MICROUSD` | 5,000,000 ($5) |
| `NEXUS_AI_CONCURRENCY` | 2 global |

Quota days/months use UTC. Costs use integer micro USD; $1 = 1,000,000 micro USD. These limits are product configuration, not statements that inference is free. Prices are not assumed: configure positive micro USD per million tokens for the chosen model. A request reserves a conservative input-byte token bound plus 512 output tokens inside an immediate SQLite transaction before calling the provider. All replicas would need the same ledger; this implementation is for a single backend deployment. Prompt sizes, context IDs and modes are validated. Course context comes only from authored allowlisted lessons; user input cannot select a filesystem path, URL, tool or secret.

Responses are buffered and bounded (20-second timeout, 64 KB provider payload, 16,000-character answer), not streamed. An AbortSignal cancels the provider HTTP request on timeout. Responses render as text, not HTML. Obvious key/password forms are redacted, but the UI still warns learners not to submit private information. Provider telemetry contains counts/costs only. Charges reconcile against reported usage. Missing/inconsistent metering, provider errors or uncertain billing preserve conservative reservations and durably disable further paid calls. If reported usage exceeds reservations, the ledger records the larger amount and closes further calls. Operators must investigate and reconcile with the provider before explicitly clearing the `provider-disabled` flag; no automatic retry can erase that stop. An interrupted process also retains its reservation; stale concurrency reservations stop counting after one minute, while cost/token reservations remain charged.

Budget exhaustion, concurrency limits, no account, disabled AI and provider failure all return clearly labeled course assistance. No anonymous request can reach the provider. BYOK is deliberately disabled: strict request schemas reject client credential fields. A future BYOK implementation must add an explicitly consented, server-side encrypted/session credential store with revocation, scoped selection and no profile exports; it must not add a key field to this browser app or reuse localStorage for credentials. Browser-local generative models are also deferred.

## Checks and reproducible demos

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e
CHROMIUM_PATH=/usr/bin/chromium pnpm test:production
pnpm audit --prod
```

Playwright starts isolated test processes/databases and exercises desktop and mobile layouts. CI installs Playwright's Chromium; omit `CHROMIUM_PATH` there. `tests/api.test.ts` injects provider test doubles only inside automated tests. Production has no fake provider switch or canned AI response. Browser tests use the real disabled-provider fallback and real Pyodide, not test doubles. Automated WCAG A/AA scans cover representative screens; they do not replace full manual assistive-technology testing.

Demo paths: landing → goal → Open Source course → answer quizzes → module worksheet; Lab → Git challenge / logic truth table; Lab → Python → load → execute each sample; Lab → spreadsheet → change cell values → check formula; lesson → learning assistant → select any teaching mode; Me → optional account → sync in a second browser context.

GitHub Actions workflow is included for these commands, but no remote CI run or public deployment has been performed in this session. Heavy Python assets and views load on demand; no service worker/offline app installation is implemented. Already loaded course text remains available while the page is open offline; cold offline reload is not promised.
