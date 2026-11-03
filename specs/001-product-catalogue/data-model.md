# Data model: Product catalogue MVP

Types are defined in `packages/contracts/src/index.ts` (HTTP shape) and
`apps/api/src/enquiries/enquiryRepository.ts` (stored enquiry).

## Product

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stringified upstream id, so a future source can use any id format |
| `title` | string | |
| `description` | string | Full text, on the product page only |
| `excerpt` | string | Summaries only: sentence-cased, ≤ 120 chars, cut at a word boundary |
| `price` | `{ amount: number; currency: string }` | Currency assumed `USD` for Fake Store |
| `imageUrl` | string | |
| `category` | `Category` | |
| `rating` | `{ average: number; count: number }` | Average 0–5 |

`ProductSummary` is a `Product` with `excerpt` instead of `description`, used in lists and cards.

## Category

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | URL-safe, e.g. `mens-clothing` (lower-case, apostrophes dropped, non-alphanumerics → `-`) |
| `name` | string | Display name, first letter capitalised, e.g. `Men's clothing` |

`CategorySummary` adds `productCount` and `previewImageUrls` (best-rated first, up to 3).

### Ranking rule

Products are ranked by `rating.average` (highest first), with ties broken by `rating.count`
(more reviews first). A category's first `CATEGORY_TOP_RATED_COUNT` (default 3) are "top rated";
the rest are "more".

## Enquiry (stored)

Table `enquiries` (created on first use):

| Column | Type | Rules |
| --- | --- | --- |
| `id` | TEXT PK | UUID |
| `product_id` | TEXT | Must exist in the product source at submission time |
| `product_title` | TEXT | Copied at submission, so it survives catalogue changes |
| `name` | TEXT | Required, trimmed, ≤ 100 chars |
| `email` | TEXT | Required, valid, lower-cased, ≤ 254 chars |
| `phone` | TEXT NULL | Optional, ≤ 30 chars, digits/space/`+()-.` only |
| `message` | TEXT NULL | Optional, ≤ 2000 chars |
| `created_at` | TEXT | ISO 8601 |
| `email_status` | TEXT | `pending` → `sent` or `failed` |

### State transitions

```
(valid submission) ──► pending ──(email sent)───► sent
                              └─(email failed)──► failed   (retryable)
(honeypot filled)  ──► not stored, not emailed, still answers 201
```
