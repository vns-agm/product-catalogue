# Agent instructions

This is an npm-workspaces monorepo: `apps/api` (Express 5, TypeScript, CommonJS),
`apps/web` (React 18 + Vite), `packages/contracts` (type-only API contract).

## Commands
- `npm run dev`: API on :3001 and web on :5173 (web proxies `/api`)
- `npm test`: all tests. Run them before saying a change is done.
- `npm run typecheck`: must pass

## Rules
- The client never calls third-party APIs. All product data goes through `apps/api`.
- `packages/contracts` stays type-only. Import it with `import type`; never add runtime code.
  (The Vercel function compiles `apps/api` sources directly and would not transpile a
  TS workspace package.)
- Concrete implementations (product source, DB, email) are chosen only in
  `apps/api/src/container.ts`. Everything else depends on the interfaces.
- Map upstream data into contract types in the adapter. Never pass upstream shapes through.
- Validate all request input with zod in the route. Throw `AppError` subclasses from
  `http/errors.ts` instead of writing error responses by hand.
- Colours, spacing and fonts go in `apps/web/src/styles/tokens.css`, not in components.
- New behaviour needs a test: API tests go through Supertest against `createApp` with the fakes
  in `apps/api/test/fixtures.ts`; web tests render the real route tree with `api` stubbed.
- Never commit secrets. New config goes in `apps/api/src/config.ts` and `.env.example`.
- Record new assumptions or cuts in `DECISIONS.md`.
