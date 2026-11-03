# Implementation Plan: Premium editorial redesign

**Spec:** [`spec.md`](./spec.md) · **Date:** 2026-11-03 · **Status:** Done

## Summary

Replace the gradient theme with an editorial design system defined in tokens, rebuild the
layout components and pages on top of it, add scroll reveals and page transitions without
new dependencies, and add a short `excerpt` to product summaries in the API.

## Technical context

| | |
| --- | --- |
| **Fonts** | Cormorant Garamond (display), Inter (text), via Google Fonts with `display=swap` |
| **Styling** | Plain CSS: `tokens.css` (variables) + `global.css` (components). No CSS framework |
| **Motion** | CSS transitions; `IntersectionObserver` for reveals; `prefers-reduced-motion` honoured |
| **Icons** | Inline thin-line SVGs in `components/Icon.tsx` (no icon library) |
| **New dependencies** | None |

## Constitution check

| Principle | Status | Notes |
| --- | --- | --- |
| I. Spec before code | ✅ | This spec |
| II. Boundaries | ✅ | Restyle confined to tokens + components; data flow unchanged |
| III. Contract first | ✅ | `excerpt` added to `ProductSummary` in contracts and API in one change |
| IV. Tests | ✅ | 001 tests kept; new tests for excerpt and category cards |
| V. Secure | ✅ | No change to input handling |
| VI. Runs anywhere | ✅ | No new setup |
| VII. Considered design | ✅ | Implements `docs/style-guide.md` |
| VIII. AI-assisted | ✅ | Changes verified in the browser at four widths, both colour schemes |

## Source changes

```
apps/web/src/styles/tokens.css        new palette, type, radius, shadow, motion tokens
apps/web/src/styles/global.css        rewritten component styles
apps/web/src/components/Icon.tsx      new: thin-line icon set
apps/web/src/components/Reveal.tsx    new: below-the-fold scroll reveal
apps/web/src/components/Layout.tsx    announcement, header, mobile menu, footer, transitions
apps/web/src/components/ProductCard.tsx, CategoryCard.tsx, RatingStars.tsx, Skeleton.tsx, Status.tsx, SearchBar.tsx
apps/web/src/pages/*                  editorial page headers and sections
apps/api/src/catalogue/catalogueService.ts   excerpt()
packages/contracts/src/index.ts       ProductSummary.excerpt
```

## Decisions

1. **Reveal only below the fold.** `Reveal` checks the element's position at mount and leaves
   on-screen content static, so nothing above the fold is ever hidden behind an animation.
2. **Always-light image panels.** `--color-panel` stays light in dark mode, because product shots
   have white backgrounds. Images use `mix-blend-mode: multiply` to sit cleanly on the panel.
3. **Excerpt in the API**, not CSS truncation, so the text is sentence-cased and cut at a word
   boundary for every client.
4. **No layout shift.** Skeletons share the final grid and 4:5 media ratio.
