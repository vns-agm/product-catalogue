# AI usage

> **Note to self before submitting:** this file records what happened in the AI build session.
> Add your own review notes, any changes you made, and your real time split below, so that
> it is accurate and you can defend every line.

## Tools and models

- **An AI coding agent** for planning, all code, tests, docs, and driving the Vercel, Turso and
  GitHub CLIs.
- The agent's built-in browser was used to click through the running app and check the
  layout and the enquiry flow.

## Agent instruction files

- [`AGENTS.md`](AGENTS.md): repo conventions and boundaries for any coding agent (plain
  Markdown, read by most agent tools).

## Plan / spec

The brief itself was the spec. The plan the agent worked to:

1. Pick React + TS and Node + TS so one type-only contract can be shared.
2. Put the three things the brief says will change (product source, look and feel, email
   provider) behind explicit boundaries: `ProductSource`, design tokens, `EmailSender`.
3. Persist enquiries before emailing, so a lead is never lost.
4. Make local setup need nothing but Node: SQLite file and console email by default.
5. Test the API over HTTP with fakes only at the edges, and test the client by rendering the
   real routes.
6. Deploy to Vercel with Turso for enquiries.

## Key prompts / moments

1. **The initial prompt:** "Build this entire project and make it deploy on my vercel account and
   connect to the tursoDB if the database setup is required. Add this project to my git account
   also", with the challenge PDF attached.
2. **Deciding what the database is for.** Products come from Fake Store, so the only state is
   enquiries. Storing them *before* emailing (with an `email_status`) turned "the email might fail"
   from a lost lead into a retryable record.
3. **Choosing libSQL.** The same client talks to a local SQLite file (no account for the reviewer,
   as the brief requires) and to Turso in production, with only a URL change.
4. **Keeping `packages/contracts` type-only**, so the Vercel function can compile the API from
   source without a separate build step for shared code.
5. **Fake Store blocking Vercel** (below) became a practical test of the `ProductSource` boundary.
   The fix was a new adapter plus one config value.

## Where the AI got things wrong, and how it was caught

| What went wrong | How it was caught | Fix |
| --- | --- | --- |
| Assumed fakestoreapi.com would be reachable from the hosted API. It returns **HTTP 403** to Vercel's IPs. A User-Agent header didn't help. | Post-deploy smoke test with `curl`, then the Vercel function logs | Added `FakeStoreSnapshotSource` and `PRODUCT_SOURCE`. Documented in DECISIONS.md |
| The API read the generic `PORT` env var. The dev-preview tool set `PORT=5173` for Vite, so the API tried to bind the web port and every `/api` call failed. | Opening the app in the browser showed "Something went wrong"; the Vite proxy logged `ECONNREFUSED` | Renamed to `API_PORT` |
| The default featured products included 2.9★ items under a "Top rated" heading | Looking at the rendered home page | Picked well-rated defaults |
| Product images stretched the square image frame (CSS `aspect-ratio` grows to fit its content) | Screenshot of the home page | `overflow: hidden` on the frame |
| `vite@6` in the web app clashed with the `vite@7` that Vitest pulls in, which broke type checking of `vite.config.ts` | `tsc` failure | Aligned on Vite 7 |
| A missing form field showed zod's generic "Required" | Reading the API's 400 response during a manual test | Added `required_error` messages |

## Time spent

| Phase | Time |
| --- | --- |
| AI build session (planning, building, testing, deploying) | ~1 hour wall clock |
| My review of the code and docs | _fill in_ |
| **Total** | _fill in_ |
