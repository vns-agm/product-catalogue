# Research & decisions: Product catalogue MVP

Each decision lists what was chosen, why, and what else was considered.

## R1. Client and backend stack

- **Decision:** React + TypeScript (Vite) client; Node.js + TypeScript (Express 5) API.
- **Why:** TypeScript on both sides allows one shared, type-only contract. Express is widely
  known and runs as a long-lived server, in a container or as a serverless function.
- **Alternatives:** Laravel (two languages, no shared types); Next.js full-stack (blurs the
  client/backend boundary the brief asks to see).

## R2. Where product data comes from

- **Decision:** a `ProductSource` interface with a Fake Store adapter that maps upstream data
  into our own `Product` type.
- **Why:** the brief says the data source will change. Mapping in the adapter means Fake Store's
  field names (`rate`, `image`) never reach the client.
- **Alternatives:** proxying Fake Store's JSON straight through (couples the client to the vendor).

## R3. Search and filtering without upstream support

- **Decision:** load all products once, cache for `PRODUCT_CACHE_TTL_SECONDS` (default 300),
  and search in memory. Each whitespace-separated word must appear in the title, description
  or category name, ignoring case.
- **Why:** Fake Store has 20 products and no search endpoint.
- **Alternatives:** a search index (overkill at this size; possible later behind the same interface).

## R4. Hosting and the 403

- **Finding:** fakestoreapi.com answers HTTP 403 to requests from Vercel (observed from the
  `bom1` and `sfo1` regions). Adding a User-Agent didn't help.
- **Decision:** a second adapter, `FakeStoreSnapshotSource`, serving a committed copy of the same
  data, selected with `PRODUCT_SOURCE=fakestore-snapshot`. Locally, the live API remains the default.
- **Alternatives:** calling Fake Store from the browser (ruled out by the brief); a third-party
  proxy (adds a dependency and a point of failure).

## R5. Enquiry storage

- **Decision:** libSQL via `@libsql/client`: a SQLite file locally, Turso when hosted.
- **Why:** same client and SQL in both places; reviewers need no account.
- **Alternatives:** Postgres (needs a server locally); no storage (loses leads when email fails).

## R6. Email

- **Decision:** an `EmailSender` interface with `ConsoleEmailSender` (default) and `SmtpEmailSender`.
- **Why:** no account is needed to run it, and SMTP works with Amazon SES, Mailgun, Gmail or
  Mailpit with configuration only.

## R7. Abuse protection

- **Decision:** a hidden honeypot field, plus 5 enquiries per minute per IP (in-memory).
- **Why:** cheap and invisible to real users. CAPTCHA is overkill for a proof of concept.

## R8. Error handling

- **Decision:** typed `AppError` subclasses (`NotFoundError` 404, `ValidationError` 400 with
  field messages, `UpstreamError` 502 with details hidden), plus one error handler that always
  returns `{ error: { code, message, fields? } }`.
