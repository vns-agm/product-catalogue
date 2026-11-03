# Quickstart: run and verify the catalogue

## Run

```bash
npm install
npm run dev        # web on http://localhost:5173, API on :3001
```

## Verify each acceptance criterion by hand

| # | Do this | Expect |
| --- | --- | --- |
| 1 | Open http://localhost:5173 | "The most loved pieces" shows the 5 featured products, ranked No. 1–5 |
| 2 | Click **Electronics** in the header | "Top rated in Electronics" (3 products), then "More in Electronics"; changing **Sort by** re-orders the second list |
| 3 | Type `jacket` in the search box and click **Search** | "4 results for “jacket”", every result mentioning a jacket |
| 4 | Click any product | The product page with full description, price and rating |
| 5 | Click **Enquire**, fill in name and email, click **Send enquiry** | "Thank you" appears; the `[api]` terminal prints the sales email |

Check the stored enquiry:

```bash
sqlite3 apps/api/data/local.db "SELECT product_title, name, email_status FROM enquiries;"
```

## Automated checks

```bash
npm run typecheck
npm test           # API (Supertest) + web (Testing Library)
npm run build
```

## Where each criterion is tested

| Criterion | API test | UI test |
| --- | --- | --- |
| Featured products | `apps/api/test/app.test.ts` › `GET /api/featured` | `apps/web/test/app.test.tsx` › home page |
| Category page | › `GET /api/categories/:slug` | › category page, category sorting |
| Search | › `GET /api/search` | › search |
| Product details | › `GET /api/products/:id` | › product page and enquiry |
| Enquiry | › `POST /api/enquiries` | › product page and enquiry |
