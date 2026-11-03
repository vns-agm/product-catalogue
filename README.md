# Product Catalogue

A proof-of-concept product catalogue: browse featured products and categories, search, view a
product and send an enquiry that emails the sales inbox.

**Live demo:** https://product-catalogue-xi.vercel.app

| Layer    | Choice                             |
| -------- | ---------------------------------- |
| Client   | React 18 + TypeScript (Vite)       |
| Backend  | Node.js + TypeScript (Express 5)   |
| Storage  | libSQL: a SQLite file locally, Turso in production |
| Email    | Pluggable: console (default) or any SMTP server |

**Why this stack:** TypeScript on both sides lets the client and API share one type-only
contract (`packages/contracts`) without sharing runtime code. React with Vite is the
lightest setup that is still production-grade. Express is boring on purpose: everyone
knows it, and the same app runs locally, in a container, on AWS Lambda or ECS, or on
Vercel. More in [DECISIONS.md](DECISIONS.md).

## Run it locally

You need **Node.js 20 or newer** and npm. No accounts, API keys or Docker.

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**.

- The web app runs on `:5173` and proxies `/api` to the API on `:3001`.
- Enquiry emails are **printed in the terminal** (look for the `[api]` lines) because
  `EMAIL_PROVIDER` defaults to `console`.
- Enquiries are saved to a SQLite file at `apps/api/data/local.db`, created on first use.
- Product data comes live from the Fake Store API, through the backend.

No configuration is needed. To change anything, copy `apps/api/.env.example` to
`apps/api/.env` and edit it. Every setting is documented in that file.

### Tests

```bash
npm test          # API (Vitest + Supertest) and web (Vitest + Testing Library)
npm run typecheck
```

### Seeing a real email locally (optional)

Run any SMTP catcher, for example [Mailpit](https://mailpit.axllent.org/), and set the
following in `apps/api/.env`:

```
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
```

Emails then appear in the Mailpit inbox at http://localhost:8025. The same settings work
with Amazon SES SMTP or any other provider.

## Configuration

All configuration is read from environment variables and validated at startup
(`apps/api/src/config.ts`). These are the ones you are most likely to change:

| Variable | Default | Purpose |
| --- | --- | --- |
| `FEATURED_PRODUCT_IDS` | `3,5,12,18,19` | The 5 hand-picked "top rated" products on the home page, in order |
| `CATEGORY_TOP_RATED_COUNT` | `3` | How many products appear under "Top rated" on a category page |
| `PRODUCT_SOURCE` | `fakestore-api` | `fakestore-api` (live) or `fakestore-snapshot` (committed copy) |
| `DATABASE_URL` / `DATABASE_AUTH_TOKEN` | `file:data/local.db` | libSQL URL. Use `libsql://…` + token for Turso |
| `EMAIL_PROVIDER` | `console` | `console` or `smtp` |
| `SALES_INBOX_EMAIL` | `sales@example.com` | Where enquiries are sent |

## Project structure

```
apps/
  api/                    Express API
    src/
      catalogue/          ProductSource interface, Fake Store adapters, merchandising rules
      enquiries/          validation, persistence (libSQL), enquiry workflow
      email/              EmailSender interface, console + SMTP senders, email template
      http/               routes and error types
      app.ts              builds the Express app from injected services
      container.ts        composition root: picks concrete implementations from config
      server.ts           local entry point
    test/
  web/                    React client
    src/
      api/client.ts       the only place the client talks to the backend
      pages/, components/, hooks/
      styles/tokens.css   design tokens (colours, type, spacing)
    test/
packages/
  contracts/              type-only API contract shared by client and API
api/index.ts              Vercel serverless entry: wraps the same Express app
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/featured` | Featured ("top rated") products for the home page |
| GET | `/api/categories` | All categories |
| GET | `/api/categories/:slug` | `{ category, topRated, more }` |
| GET | `/api/search?q=term` | Products where every term matches the title, description or category |
| GET | `/api/products/:id` | Product details |
| POST | `/api/enquiries` | `{ productId, name, email, phone?, message? }` → `201 { enquiryId }` |
| GET | `/api/health` | Liveness check |

Errors always look like `{ "error": { "code", "message", "fields?" } }`.

## Deployment

The live demo runs on Vercel. The web app is served as static files and `api/index.ts`
runs the Express app as a serverless function. Enquiries are stored in a Turso
(hosted libSQL) database. Production environment variables:

```
DATABASE_URL=libsql://<db>.turso.io
DATABASE_AUTH_TOKEN=<token>
PRODUCT_SOURCE=fakestore-snapshot   # fakestoreapi.com returns 403 to Vercel's IPs
```

The hosted demo leaves `EMAIL_PROVIDER=console`, so enquiry emails appear in the Vercel
function logs. To deliver them for real, set `EMAIL_PROVIDER=smtp` and the `SMTP_*` variables.

Nothing here depends on Vercel. To move to AWS, run `apps/api` as a container (ECS/App Runner)
or behind Lambda, and serve `apps/web/dist` from S3 + CloudFront.

## Further reading

- [DECISIONS.md](DECISIONS.md): assumptions, cuts, how this grows, what's next
- [AI_USAGE.md](AI_USAGE.md): how AI tools were used and where they went wrong
- [CLAUDE.md](CLAUDE.md): instructions for AI coding agents working in this repo
