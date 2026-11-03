# Implementation Plan: Product catalogue MVP

**Spec:** [`spec.md`](./spec.md) · **Date:** 2026-11-03 · **Status:** Done

## Summary

A React + TypeScript client and an Express + TypeScript API in one npm-workspaces monorepo,
sharing a type-only contract. The API wraps the Fake Store API behind a `ProductSource`
boundary, stores enquiries in libSQL before emailing them through an `EmailSender`, and runs
unchanged locally and as a Vercel serverless function.

## Technical context

| | |
| --- | --- |
| **Language / version** | TypeScript 5, Node.js 20+ |
| **Client** | React 18, React Router 6, Vite 7 |
| **API** | Express 5, zod, helmet, express-rate-limit, nodemailer |
| **Storage** | libSQL: `file:data/local.db` locally, Turso when hosted |
| **Testing** | Vitest; Supertest (API); Testing Library + jsdom (web) |
| **Target platform** | Modern browsers; Node server or serverless (Vercel today, AWS-compatible) |
| **Constraints** | No accounts or paid services needed locally; client never calls Fake Store |
| **Scale** | 20 products, 4 categories |

## Constitution check

| Principle | Status | Notes |
| --- | --- | --- |
| I. Spec before code | ✅ | This spec (retroactive) |
| II. Boundaries | ✅ | `ProductSource`, `EnquiryRepository`, `EmailSender`, tokens; wired in `container.ts` |
| III. Contract first | ✅ | `packages/contracts`, type-only |
| IV. Test the critical path | ✅ | Every acceptance criterion tested at API and UI level |
| V. Secure by default | ✅ | zod, typed errors, helmet, 10 kB body limit, honeypot, rate limit, escaped email |
| VI. Runs anywhere | ✅ | `npm install && npm run dev`, SQLite + console email defaults |
| VII. Considered design | ✅ | Tokens + style guide (see spec 002) |
| VIII. AI-assisted, human-owned | ✅ | `AI_USAGE.md` records the AI's mistakes and fixes |

## Project structure

```
apps/
  api/src/
    catalogue/   productSource.ts (interface + search matcher)
                 fakeStoreSource.ts (live API + snapshot adapters, mapping, cache)
                 catalogueService.ts (featured, category ranking, excerpts)
    enquiries/   enquirySchema.ts (zod) · enquiryRepository.ts (libSQL) · enquiryService.ts
    email/       emailSender.ts (console, SMTP) · enquiryEmail.ts (template, escaping)
    http/        routes.ts · errors.ts
    app.ts       Express app from injected services
    container.ts composition root
    config.ts    validated environment
    server.ts    local entry
  web/src/
    api/client.ts   the only place the client calls the backend
    pages/          Home, Category, Search, Product, NotFound (code-split)
    components/     cards, grids, form, layout, states
    styles/         tokens.css · global.css
packages/contracts/  type-only HTTP contract
api/index.ts         Vercel serverless entry
```

## Key decisions

See [`research.md`](./research.md). In short:

1. **Persist, then email.** Enquiries are written with `email_status = pending`, then updated
   to `sent` or `failed`.
2. **List-backed adapter.** Fake Store has no search or filtering, so the adapter loads all
   products once, caches them (5 minutes, shared in-flight promise, failures not cached) and
   answers queries in memory. The `ProductSource` interface stays query-shaped, so a real
   source can push queries down.
3. **Snapshot source for hosting.** fakestoreapi.com returns HTTP 403 to Vercel's IPs, so the
   hosted demo uses `PRODUCT_SOURCE=fakestore-snapshot`, a committed copy of the same data.
4. **Code-split routes.** The home page ships in the main bundle; other pages load on first visit.

## Design

- **Data model:** [`data-model.md`](./data-model.md)
- **HTTP contract:** [`contracts/api.md`](./contracts/api.md)
- **Run and verify:** [`quickstart.md`](./quickstart.md)

## Complexity tracking

| Exception | Why | Removed when |
| --- | --- | --- |
| Schema created on first use instead of migrations | One table; a migration tool is overhead today | The schema first needs to change |
| Rate limit is in-memory per instance | Good enough to stop casual floods | A shared store (Redis) or WAF rule is added |
