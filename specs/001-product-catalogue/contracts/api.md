# HTTP contract: Catalogue API

Base path `/api`. JSON only. Types are in `packages/contracts/src/index.ts`; this file is the
human-readable version and must change in the same commit as those types.

## Errors (all endpoints)

```json
{ "error": { "code": "validation_failed", "message": "Request is invalid", "fields": { "email": "Please enter a valid email address" } } }
```

| Status | `code` | When |
| --- | --- | --- |
| 400 | `validation_failed` | Input failed validation (`fields` lists each problem) |
| 400 | `bad_request` | Malformed JSON or body over 10 kB |
| 404 | `not_found` | Unknown product, category or route |
| 429 | `rate_limited` | More than 5 enquiries a minute from one IP |
| 502 | `upstream_unavailable` | The product source failed (details logged, not returned) |
| 500 | `internal_error` | Anything unexpected |

Read endpoints send `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`.

## Endpoints

### `GET /api/health`
`200 { "status": "ok" }`

### `GET /api/featured` → `FeaturedResponse`
`{ products: ProductSummary[] }`: the configured featured products (`FEATURED_PRODUCT_IDS`),
in configured order. Unknown ids are skipped.

### `GET /api/categories` → `CategoriesResponse`
`{ categories: CategorySummary[] }`, sorted by name. Each category has `productCount` and up to three
`previewImageUrls` (best rated first).

### `GET /api/categories/:slug` → `CategoryPageResponse`
`{ category: Category, topRated: ProductSummary[], more: ProductSummary[] }`. `404` if the slug is unknown.

### `GET /api/search?q=term` → `SearchResponse`
`{ query: string, products: ProductSummary[] }`. `q` is trimmed and must be 1–100 characters, or `400`.

### `GET /api/products/:id` → `ProductResponse`
`{ product: Product }` (with full `description`). `404` if unknown.

### `POST /api/enquiries` → `EnquiryResponse`

Request (`EnquiryRequest`):

```json
{ "productId": "3", "name": "Ada Lovelace", "email": "ada@example.com", "phone": "+44 20 7946 0000", "message": "Is this in stock?", "company": "" }
```

| Field | Required | Rules |
| --- | --- | --- |
| `productId` | ✓ | Must be an existing product (`400` with `fields.productId` otherwise) |
| `name` | ✓ | 1–100 chars after trimming |
| `email` | ✓ | Valid email, ≤ 254 chars |
| `phone` | | ≤ 30 chars; digits, spaces and `+()-.` |
| `message` | | ≤ 2000 chars |
| `company` | | Honeypot: must be empty. If filled, the request is silently discarded |

Response `201 { "enquiryId": "uuid" }`, returned even if the email fails (the enquiry is stored as `failed`).
