# Decisions and assumptions

## Assumptions where the acceptance criteria were unclear

**"I have chosen 5 products to be top rated" (home page).**
"Chosen" means the entrepreneur picks them by hand. They are not computed from ratings. For now
the list is configuration (`FEATURED_PRODUCT_IDS`, in display order), so changing it needs no code
change. The defaults are five well-rated products from different categories. If a configured id
no longer exists it is skipped and a warning is logged; the page does not break.

**"Top rated products for that category" and "additional products" (category page).**
Fake Store has ratings, so top rated is computed: products are sorted by average rating, with
review count breaking ties so that one 5★ review doesn't beat 400 4.8★ reviews. The first
`CATEGORY_TOP_RATED_COUNT` (default 3) are "Top rated" and the rest are "More in …". Every
product in the category appears exactly once.

**"Products that have text matching that search term".**
The search is case-insensitive. The term is split on whitespace and every word must appear
somewhere in the title, description or category name, so `wide screen` finds "Ultra wide
screen". The search runs when the button is clicked (or Enter is pressed), not as you type, which
is what the criteria describe. An empty term disables the button, and the API rejects empty or
over-long terms with a 400.

**Enquiry form fields.**
Name and email are required. Phone and message are optional. Sales needs a way to reply,
and every extra required field loses leads. The email goes to a configurable sales inbox with
`Reply-To` set to the customer, so sales can just hit reply.

**What "the sales inbox will receive an email" means in a PoC.**
The email provider is expected to change and the reviewer must not need an account, so the
default provider prints the email to the API log. Switching to SMTP is configuration only.

**If the email fails.**
The enquiry is saved to the database *before* sending, and its `email_status` is updated to
`sent` or `failed`. If the provider is down, the customer still sees "Thank you", because their
lead is captured and can be re-sent, whereas an error would just make them leave. This is a
deliberate trade-off. The alternative, failing loudly, is defensible too.

**Currency.** Fake Store has none. It is a US store, so prices are assumed to be USD. The contract
carries `{ amount, currency }` so a real source can supply it.

**Visual design.** The look is a placeholder for the brand's real creative work, but it is
built to be swapped: a warm-ivory palette, an editorial serif (Cormorant Garamond) for display
type with Inter for text, and one restrained bronze accent, all defined in
`apps/web/src/styles/tokens.css`. Product photos sit on always-light panels (`--color-panel`)
because Fake Store images have white backgrounds; this keeps them clean in dark mode too.

**Card descriptions.** Product cards show a short excerpt rather than the full description.
The API builds it (`excerpt` in `CatalogueService`: sentence-cased, cut at a word boundary,
120 characters) so every client gets the same text and full descriptions stay on the product page.

## Requirements dropped or simplified, and why

- **No admin UI for choosing featured products.** Configuration covers the criterion, and an admin
  UI needs authentication, which is a project in itself.
- **No pagination.** Fake Store has 20 products. The `ProductSource` interface is query-shaped so
  pagination can be added at the source when there is real data.
- **Schema setup is `CREATE TABLE IF NOT EXISTS` on first use**, not a migration tool. That's
  fine for one table and should be replaced the moment the schema needs to change.
- **Rate limiting is in-memory per instance** (5 enquiries/minute/IP). It stops a casual flood
  locally, but on serverless each instance has its own counter. A shared store (Redis/Upstash) or a
  WAF rule is the real fix.
- **Spam protection is a honeypot field only**, with no CAPTCHA. It's cheap and invisible, and
  enough for a PoC.
- **No Docker Compose.** Plain `npm install && npm run dev` is two commands, and it needs nothing
  but Node. That's simpler for a reviewer than requiring Docker.
- **Client-side validation is deliberately loose** (required fields, email shape). The server's
  zod schema is the source of truth, and its field errors are shown in the form.
- **Hosted demo uses a Fake Store snapshot.** `fakestoreapi.com` returns HTTP 403 to requests
  from Vercel's servers (seen from both the `bom1` and `sfo1` regions). Rather than call it from
  the browser, which the constraints rule out, I added a second `ProductSource` that serves
  a committed copy of the same data, selected with `PRODUCT_SOURCE=fakestore-snapshot`. Locally
  the live API is still the default. Product *images* still load from fakestoreapi.com in the
  browser. They are static assets, not product data.

## How the design supports growth beyond the PoC

The brief says the product data source, the look and feel, and the email provider will all
change. Each of those sits behind a boundary:

| What changes | Where it's isolated | What a change looks like |
| --- | --- | --- |
| Product data source | `ProductSource` interface (`apps/api/src/catalogue/productSource.ts`) | Write a new adapter, select it in `container.ts`. The routes, client and contract don't change. The snapshot source shows this: it was added to fix a real deployment problem without touching anything else. |
| Data shape | `packages/contracts` | The API maps upstream data into *our* types (`toProduct`), so Fake Store's field names (`rate`, `image`) never reach the client. |
| Email provider | `EmailSender` interface | Add an SES/Resend/Postmark sender, or point SMTP at it. |
| Database | `EnquiryRepository` interface + libSQL | SQLite file → Turso is a URL change. Postgres would be a new repository class. |
| Look and feel | `apps/web/src/styles/tokens.css` + small components | Restyling is mostly editing tokens. Components have no inline styling. |
| Merchandising rules | `CatalogueService` | "Featured" and "top rated" logic lives in one place, separate from both the source and HTTP. |
| Hosting | `createApp()` is host-agnostic | `server.ts` for a long-running process, `api/index.ts` for serverless. AWS options are in the README. |

Other choices that help it grow:
- The composition root (`container.ts`) is the only place that knows the concrete classes.
  Everything else takes its dependencies through constructors, which is also why the HTTP tests
  can run the real app with fakes only at the edges.
- Config is validated with zod at startup, so a bad deploy fails immediately with a clear message.
- Errors are typed (`NotFoundError`, `ValidationError`, `UpstreamError`). Upstream details are
  logged but never sent to the client.

## What I'd do next with another day

1. **Featured products in the database, with a minimal authenticated admin page** to pick them,
   so the entrepreneur can merchandise without a deploy.
2. **A retry job for `email_status = 'failed'` enquiries** (cron or queue), plus an alert.
3. **A real email provider in the hosted demo** (SES or Resend), with a confirmation email to
   the customer.
4. **Playwright end-to-end tests** for the five acceptance criteria against the running stack,
   in CI on every PR (GitHub Actions: typecheck, unit tests, e2e).
5. **Migrations** (Drizzle or similar) instead of create-on-first-use.
6. **Shared rate limiting** and structured logging with request ids.
7. **SEO and performance:** server-render or pre-render product pages, add image sizing, and
   cache product responses at the CDN with proper invalidation.
