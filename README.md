# NEXUS LAB

Chinese-first interactive technology academy. Built incrementally on the product specifications in `docs/`.

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
