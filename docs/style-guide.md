# Style guide

How this product looks, moves, reads and is coded. Tokens referenced here live in
[`apps/web/src/styles/tokens.css`](../apps/web/src/styles/tokens.css); component styles in
[`global.css`](../apps/web/src/styles/global.css). If this guide and the tokens disagree, fix one
of them in the same change.

---

## Part 1: Visual design

### 1. Principles

1. **Quiet confidence.** Generous whitespace, few colours, strong type. The products are the colour.
2. **Editorial, not template.** Asymmetric compositions, serif headlines, small caps labels.
3. **Every pixel intentional.** Consistent spacing, radius and alignment; nothing decorative
   without a job.
4. **Calm motion.** Animation confirms an action or reveals content; it never performs.
5. **Accessible by default.** Contrast, focus and reduced motion are requirements, not polish.

**Avoid:** decorative gradients, glassmorphism, emoji or cartoon icons, neon accents, dense
dashboards, more than one accent colour, centred body text longer than three lines.

### 2. Colour

| Token | Light | Dark | Use for |
| --- | --- | --- | --- |
| `--color-bg` | `#f8f6f1` warm ivory | `#141311` | Page background |
| `--color-surface` | `#fffdf9` | `#1b1a17` | Forms, story panel, empty states |
| `--color-surface-alt` | `#f1eee7` | `#24221e` | Hover fills, disabled buttons, skeletons |
| `--color-panel` / `-deep` | `#f1eee7` / `#e9e4da` | `#ece8e0` / `#e2ddd3` | Product image panels (always light) |
| `--color-inverse` | `#1c1b19` | `#f3efe7` | Primary buttons, footer, announcement bar |
| `--color-text` | `#1c1b19` | `#f3efe7` | Headings, body |
| `--color-text-muted` | `#5f5b53` | `#b9b2a6` | Descriptions, secondary copy |
| `--color-text-subtle` | `#8a857b` | `#8f897e` | Meta, counts, placeholders (never for body copy) |
| `--color-border` / `-strong` | `#e4dfd5` / `#cfc8ba` | `#2c2a26` / `#45413a` | Dividers / inputs |
| `--color-accent` | `#8a6a44` bronze | `#c9a77c` | Eyebrows, focus ring, rating star, one italic word. **Sparingly** |
| `--color-danger` | `#a83a2c` | `#e08b7d` | Errors only |
| `--color-success` | `#3f6b4f` | `#8fbf9f` | Confirmation only |

Rules:
- One accent per view. If everything is bronze, nothing is.
- Body text uses `--color-text` or `--color-text-muted` only (both ≥ 4.5:1 on `--color-bg`).
- Never hard-code a colour in a component. Add or reuse a token.

### 3. Typography

| Role | Family | Size | Weight / style |
| --- | --- | --- | --- |
| Hero title | `--font-display` (Cormorant Garamond) | `clamp(3rem, 7vw, 6.25rem)` | 500, line-height 1.02, tracking −0.015em |
| Page title | display | `clamp(2.75rem, 6vw, 5rem)` | 500 |
| Section title | display | `clamp(2.1rem, 4vw, 3.25rem)` | 500 |
| Card / form title | display | 1.6–1.9rem | 500 |
| Eyebrow | `--font-body` (Inter) | `--text-xs` 0.75rem | 600, uppercase, tracking `--tracking-caps` 0.14em, accent colour |
| Lede | body | `clamp(1.02rem, 1.4vw, 1.15rem)` | 400, line-height 1.7, max 46ch |
| Body | body | `--text-base` 1rem | 400, line-height 1.6 |
| Small / meta | body | `--text-sm` 0.875rem | 400–500 |

Rules:
- Serif for display only, never for paragraphs, labels or buttons.
- Italic in a headline is reserved for one emphasised word, in the accent colour.
- Measure: paragraphs ≤ 56ch; ledes ≤ 46ch.
- Sentence case everywhere except eyebrows (uppercase via CSS, written in sentence case).

### 4. Space and layout

- **Container:** `--container` 1280px, side gutter `--gutter` = `clamp(1.25rem, 4vw, 3rem)`.
- **Section rhythm:** `--section` = `clamp(4rem, 9vw, 7.5rem)` between major sections.
- **Grids:** product grid 4 → 3 (≤ 1100px) → 2 (≤ 820px) columns; featured edit 5 → 3 → 2;
  category grid 4 → 2 (≤ 1040px) → 1 (≤ 480px). Row gap is larger than column gap.
- **Breakpoints:** 480 · 560 · 820 · 860 · 960 (navigation collapses) · 1040 · 1100 · 1180.
- Mobile keeps two product columns; excerpts hide below 560px.

### 5. Shape and depth

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 4px | Buttons, inputs, labels |
| `--radius` | 8px | Captions, small panels |
| `--radius-lg` | 14px | Image panels, cards, forms |
| `--radius-pill` | 999px | Search field and search button only |
| `--shadow-sm` | hairline | Sticky header once scrolled |
| `--shadow` | soft | Forms, hovered buttons, captions |
| `--shadow-lg` | deep, diffused | Hovered category media |

Prefer borders and tone changes to shadows. Shadows appear on interaction, not at rest.

### 6. Components

**Buttons**
- *Primary* (`.button`): inverse fill, ivory text, 4px radius, min-height 3rem (`--large` 3.5rem).
  Hover: slightly lighter fill, soft shadow, trailing arrow nudges 3px. Active: moves down 1px.
- *Secondary* (`.button--secondary`): transparent with a strong border. Hover: surface fill, text-colour border.
- *Disabled*: `--color-surface-alt` fill, subtle text. Never just lowered opacity.
- One primary button per view region.

**Product card**: 4:5 image panel, rank label (top-left, only in ranked lists), then category
(small caps), title (2 lines max), excerpt (2 lines max), then price and rating. Hover: panel deepens,
image scales to 1.06 over 1s, "View details" bar slides up (pointer devices only).

**Category card**: 4:5 collage (one large tile, two small), serif name, product count, "Explore →".

**Forms**: label above field, optional fields marked "(optional)", errors below the field
in `--color-danger` and linked with `aria-describedby`. Focus: text-colour border plus a 3px accent-soft ring.

**Navigation**: wordmark left, category links centred with a draw-in underline, search right.
Under 960px: menu button plus full-width search, and the menu opens as a list of serif links.

**States**: loading uses skeletons matching the final layout; empty and error states use a
bordered panel with a thin icon, serif title, one sentence and at most one action.

### 7. Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur` | 0.35s | Hover, colour, underline |
| `--dur-slow` | 0.9s | Scroll reveals |
| `--ease` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | General |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |

- Page entrance: fade up 8px over 0.5s.
- Scroll reveal: fade up 28px, **only** for content that starts below the fold (`Reveal`).
- Image hover zoom: scale ≤ 1.06 over ~1s. Product-page zoom: 1.9× around the cursor.
- Never animate layout properties (width, height, top). Use `transform` and `opacity` only.
- `prefers-reduced-motion: reduce` disables all of the above.

### 8. Imagery

- Product photos sit on `--color-panel` with generous padding and `object-fit: contain`.
- Fixed aspect ratios (4:5 cards, 4:4.6 product page, 1:1 story) so nothing shifts on load.
- `loading="lazy"` below the fold, `eager` for the first visible row and hero.
- Decorative images get `alt=""`. The product page image gets the product title.

### 9. Accessibility checklist

- [ ] Landmarks: one `header`, `main#main`, `footer`; labelled `nav`s; skip link first.
- [ ] Every input has a visible `<label>`; icon-only buttons have `aria-label`.
- [ ] Visible `:focus-visible` ring (2px accent, 3px offset) on everything interactive.
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for 24px+ display type).
- [ ] Works with keyboard only; Escape clears search; `/` focuses search.
- [ ] Reduced motion respected; no information conveyed by motion alone.

### 10. Voice and copy

- Calm, specific, warm. Short sentences. No exclamation marks, no hype ("amazing", "unbeatable").
- Lead with the customer's benefit: "A specialist replies within one business day", not "Our team is awesome".
- Buttons are verbs: "Enquire", "Send enquiry", "Explore the collection".
- Errors say what happened and what to do: "Please enter a valid email address."

---

## Part 2: Code style

### TypeScript

- `strict` with `noUncheckedIndexedAccess`. No `any`. Use `unknown` and narrow it.
- Types shared over HTTP live in `packages/contracts`, imported with `import type`.
- Prefer named exports, small pure functions, and `readonly` constructor injection for services.
- Validate external input (HTTP bodies, query strings, upstream payloads, env) with zod at the edge.

### React

- Function components; one component per concept; pages in `pages/`, reusable parts in `components/`.
- Data fetching only through `api/client.ts` + `useApi`. Components never call `fetch`.
- Render the three states explicitly through `AsyncContent`: loading (skeleton), error (retry), success.
- Query-friendly markup: give lists and forms accessible names (they're what the tests select on).

### CSS

- Tokens in `tokens.css`; components in `global.css`, grouped by section with a banner comment.
- Class names: `block`, `block__element`, `block--modifier`; state as `is-*` (`is-loaded`, `is-zoomed`).
- No inline styles except dynamic custom properties (e.g. `--zoom-x`).

### Naming and files

| Thing | Convention | Example |
| --- | --- | --- |
| Components | PascalCase file and export | `ProductCard.tsx` |
| Hooks | `useX` camelCase | `useApi.ts` |
| Services / adapters | camelCase file, PascalCase class | `catalogueService.ts` → `CatalogueService` |
| Tests | mirror the subject, `.test.ts(x)` | `fakeStoreSource.test.ts` |
| Specs | `specs/NNN-kebab-name/` | `specs/002-premium-redesign/` |

### Tests

- Name tests by behaviour ("returns field errors for invalid input and sends nothing").
- API: Supertest against `createApp` with fakes from `test/fixtures.ts`.
- Web: render the real `routes` with `createMemoryRouter`; stub `api`; select by role and label.

### Commits

- Imperative subject ≤ 72 characters ("Show categories as preview cards"), then a body explaining *why*.
- One logical change per commit; reference the spec task where relevant (`T013`).
