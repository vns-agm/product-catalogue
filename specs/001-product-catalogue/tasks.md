# Tasks: Product catalogue MVP

**Spec:** [`spec.md`](./spec.md) · **Plan:** [`plan.md`](./plan.md) · **Status:** all done

`[P]` = parallelisable · `[USn]` = user story

## Phase 1: Setup

- [X] T001 npm workspaces monorepo: `apps/api`, `apps/web`, `packages/contracts`, shared `tsconfig.base.json`
- [X] T002 [P] Type-only HTTP contract in `packages/contracts/src/index.ts`
- [X] T003 [P] Validated configuration with defaults in `apps/api/src/config.ts` and `apps/api/.env.example`

## Phase 2: Foundations

- [X] T004 Typed errors in `apps/api/src/http/errors.ts`
- [X] T005 `ProductSource` interface and search matcher in `apps/api/src/catalogue/productSource.ts`
- [X] T006 Fake Store adapter (mapping, validation, cache) in `apps/api/src/catalogue/fakeStoreSource.ts`
- [X] T007 [P] Adapter tests in `apps/api/test/fakeStoreSource.test.ts`
- [X] T008 Express app with error handler, helmet and body limit in `apps/api/src/app.ts`
- [X] T009 Composition root in `apps/api/src/container.ts`
- [X] T010 [P] Web API client (the only `fetch`) in `apps/web/src/api/client.ts`
- [X] T011 [P] Layout, routing and `useApi` hook in `apps/web/src`

## Phase 3: US1: Featured products

- [X] T012 [US1] Test: featured products come back in configured order, in `apps/api/test/app.test.ts`
- [X] T013 [US1] `CatalogueService.getFeatured` + `GET /api/featured`
- [X] T014 [US1] Test: home page shows five featured products, in `apps/web/test/app.test.tsx`
- [X] T015 [US1] Home page with featured grid in `apps/web/src/pages/HomePage.tsx`

## Phase 4: US2: Category page

- [X] T016 [US2] Tests: ranking, tie-break, 404, category list
- [X] T017 [US2] `getCategoryPage` + `GET /api/categories`, `GET /api/categories/:slug`
- [X] T018 [US2] Category page with top-rated and more sections in `apps/web/src/pages/CategoryPage.tsx`
- [X] T019 [US2] Sort for "more", kept in the URL, with test

## Phase 5: US3: Search

- [X] T020 [US3] Tests: case-insensitive, description match, empty result, invalid term
- [X] T021 [US3] `GET /api/search` with zod-validated `q`
- [X] T022 [US3] Search bar (submit-only, disabled when empty) + search page, with test

## Phase 6: US4: Product details

- [X] T023 [US4] Tests: details and 404
- [X] T024 [US4] `GET /api/products/:id` + product page, with test for tile click

## Phase 7: US5: Enquiry

- [X] T025 [US5] zod schema in `apps/api/src/enquiries/enquirySchema.ts`
- [X] T026 [US5] libSQL repository (schema on first use) + `:memory:` test
- [X] T027 [US5] `EmailSender` (console, SMTP) and escaped template, with tests
- [X] T028 [US5] `EnquiryService`: persist, then email; honeypot; failure handling
- [X] T029 [US5] Tests: stored + emailed, field errors, unknown product, email failure, honeypot, bad JSON, rate limit
- [X] T030 [US5] Enquiry form with client checks, server field errors and "Thank you", with tests

## Phase 8: Hosting & polish

- [X] T031 Vercel entry `api/index.ts` + `vercel.json` rewrites
- [X] T032 Turso database for enquiries in production
- [X] T033 Snapshot product source after fakestoreapi.com returned 403 from Vercel
- [X] T034 README, DECISIONS.md, AI_USAGE.md, AGENTS.md

## Follow-ups (not started)

- [ ] T040 Retry job for enquiries with `email_status = 'failed'`
- [ ] T041 Featured products in the database with an authenticated admin page
- [X] T042 Playwright end-to-end tests for the five acceptance criteria (`e2e/`, `npm run test:e2e`); running them in CI is still to do
- [ ] T043 Migrations tool to replace create-on-first-use
