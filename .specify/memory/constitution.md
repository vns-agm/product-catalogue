# Product Catalogue Constitution

The non-negotiable principles for building this product, for people and AI agents alike.
Every spec, plan and change is checked against them. When a principle and a deadline
conflict, the principle wins, or the principle is amended (see Governance), never quietly ignored.

**Version:** 1.1.0 · **Ratified:** 2026-11-03 · **Last amended:** 2026-11-03 (added end-to-end gate)

---

## Core principles

### I. Spec before code

Every feature starts as a spec in `specs/NNN-feature-name/spec.md` describing *what* and
*why* (user stories, acceptance criteria, assumptions), with no technology in it. The *how*
goes in `plan.md`, and the work in `tasks.md`. Code that has no spec behind it is a prototype
and must not be merged to `main`.

- Acceptance criteria are written as GIVEN / WHEN / THEN.
- Anything unclear is recorded as `[NEEDS CLARIFICATION: …]` and resolved, or turned into a
  stated assumption, before planning.

### II. Boundaries are the product

The brief says the product data source, the look and feel and the email provider will all
change. Each therefore sits behind an explicit boundary:

| Volatile concern | Boundary |
| --- | --- |
| Product data | `ProductSource` interface (`apps/api/src/catalogue/productSource.ts`) |
| Persistence | `EnquiryRepository` interface |
| Email | `EmailSender` interface |
| Look and feel | Design tokens (`apps/web/src/styles/tokens.css`) |
| HTTP shape | `packages/contracts` |

- Concrete implementations are chosen **only** in the composition root (`apps/api/src/container.ts`).
- Upstream data is mapped into our own types in the adapter. Upstream shapes never cross a boundary.
- The client never calls a third-party API. All product data goes through `apps/api`.

### III. Contract first, type-only

`packages/contracts` is the single source of truth for the HTTP API and contains **types only**
(imported with `import type`). The API's zod schemas are the runtime source of truth for input.
A change to the contract is a change to both client and server and is made in one commit.

### IV. Test the critical path (NON-NEGOTIABLE)

- Every acceptance criterion has at least one automated test that would fail if it broke.
- API behaviour is tested over HTTP (Supertest against `createApp`) with fakes **only at the
  external edges** (product source, repository, email).
- UI behaviour is tested by rendering the real route tree with the API client stubbed, and by
  querying what a user perceives (roles, labels, text), never implementation details.
- Every user story has an end-to-end test in `e2e/` that drives the real app in a browser.
- `npm run typecheck` and `npm test` pass before any change is called done, and `npm run test:e2e`
  passes for any change to pages, routes or user flows.

### V. Secure and honest by default

- All input is validated with zod at the route. Errors are typed (`AppError` subclasses);
  upstream details are logged, never shown to users.
- No secrets in the repo, ever. Configuration lives in environment variables, is validated at
  startup, and is documented in `.env.example`.
- User-supplied text is escaped wherever it is rendered (HTML email, UI).
- Leads are never lost: enquiries are persisted before email is attempted.

### VI. Runs anywhere, needs nothing

A reviewer must be able to run the project in under ten minutes with only Node.js:
`npm install && npm run dev`. Defaults work without accounts or keys (SQLite file, console email).
Nothing may require a paid service to run locally. Hosting must stay portable (AWS-compatible).

### VII. Considered design

The interface follows the [style guide](../../docs/style-guide.md): warm, editorial and restrained.
Colours, type, spacing, radii, shadows and motion come from tokens, never hard-coded in components.
Every screen is accessible (semantic HTML, labels, focus states, reduced motion) and responsive
from 360px to large desktop, with no layout shift while data or images load.

### VIII. AI-assisted, human-owned

AI agents may plan, write code, tests and docs, but:

1. **A human owns every line.** Nothing merges that the owner cannot explain and defend.
2. **Agents follow this constitution and `AGENTS.md`** and work from a spec and plan, not from
   a vague prompt.
3. **Agents verify, not assume.** They run the tests, typecheck and the app before claiming
   success, and report failures honestly.
4. **Mistakes are recorded.** Where an AI got something wrong, the error, how it was caught and
   the fix are recorded in `AI_USAGE.md`.
5. **No secrets or personal data** are pasted into prompts or committed by agents.
6. **Small, reviewable steps.** Each change maps to a task in `tasks.md`.

---

## Quality gates

A change may merge only when all of these hold:

- [ ] It traces to a task in a spec's `tasks.md`.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes, and new behaviour has new tests.
- [ ] `npm run test:e2e` passes (required when pages, routes or flows change).
- [ ] `npm run build` succeeds.
- [ ] No new secrets, and new config is in `config.ts` and `.env.example`.
- [ ] UI changes were checked at phone, tablet and desktop widths, in light and dark mode.
- [ ] New assumptions or cuts are recorded in `DECISIONS.md`.

## Technology constraints

| Layer | Choice | Changing it requires |
| --- | --- | --- |
| Client | React + TypeScript (Vite) | Constitution amendment |
| Backend | Node.js + TypeScript (Express) | Constitution amendment |
| Storage | libSQL (SQLite file locally, Turso hosted) | Plan-level decision |
| Email | `EmailSender` implementation (console, SMTP) | Plan-level decision |
| New runtime dependency | Justified in the feature's `plan.md` | Plan-level decision |

## Governance

- This constitution supersedes other practices. `AGENTS.md`, specs and plans must agree with it.
- **Amendments** are made by pull request that changes this file, states the reason, and bumps
  the version: **MAJOR** for removing or redefining a principle, **MINOR** for adding one,
  **PATCH** for clarifications.
- Every `plan.md` includes a **Constitution Check** listing each principle as pass, or as a
  justified exception in its Complexity Tracking table.
- Exceptions are temporary and must name what would remove them.
