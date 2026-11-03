# Agent instructions

Read these first, in order:
1. [`.specify/memory/constitution.md`](.specify/memory/constitution.md): principles that override everything else
2. The spec, plan and tasks for the feature you're working on, in `specs/NNN-*/`
3. [`docs/style-guide.md`](docs/style-guide.md) for any UI or code-style question

## Spec-driven workflow
- No code without a spec: for new work, create `specs/NNN-name/` from `.specify/templates/`
  (spec, then plan with its Constitution Check, then tasks). See [`docs/README.md`](docs/README.md).
- Work one task at a time, writing the test first. Tick tasks off in `tasks.md` as they're done.
- Before saying anything is done, run `npm run typecheck`, `npm test` and `npm run build`, and check UI
  changes at phone, tablet and desktop widths.
- Record every AI mistake you catch (what, how it was caught, the fix) in `AI_USAGE.md`.


This is an npm-workspaces monorepo: `apps/api` (Express 5, TypeScript, CommonJS),
`apps/web` (React 18 + Vite), `packages/contracts` (type-only API contract).

## Commands
- `npm run dev`: API on :3001 and web on :5173 (web proxies `/api`)
- `npm test`: all tests. Run them before saying a change is done.
- `npm run typecheck`: must pass (includes the e2e suite)
- `npm run test:e2e`: Playwright end-to-end tests (desktop + mobile). Run it for any change to pages, routes or flows

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
