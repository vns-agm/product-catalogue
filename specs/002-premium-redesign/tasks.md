# Tasks: Premium editorial redesign

**Spec:** [`spec.md`](./spec.md) · **Plan:** [`plan.md`](./plan.md) · **Status:** all done

## Phase 1: Foundations

- [X] T001 Design tokens (palette, type, radius, shadow, motion, light + dark) in `apps/web/src/styles/tokens.css`
- [X] T002 Load Cormorant Garamond + Inter in `apps/web/index.html`
- [X] T003 [P] Thin-line icon set in `apps/web/src/components/Icon.tsx`
- [X] T004 [P] `Reveal` component in `apps/web/src/components/Reveal.tsx`
- [X] T005 API: `excerpt` on `ProductSummary` + tests in `apps/api/test`

## Phase 2: US3: Navigation and footer

- [X] T006 [US3] Announcement bar, header with scroll state, animated nav links
- [X] T007 [US3] Mobile menu (toggle, closes on navigation)
- [X] T008 [US3] Footer with Shop / Service / About and in-page anchors

## Phase 3: US1: Hero and home sections

- [X] T009 [US1] Editorial hero: headline, lede, CTAs, key figures, product gallery
- [X] T010 [US1] Curated category collage cards
- [X] T011 [US1] Ranked top-rated edit
- [X] T012 [US1] Brand story with principles

## Phase 4: US2: Product presentation

- [X] T013 [US2] Product cards: 4:5 media, rank label, excerpt, price + rating, hover zoom, "View details"
- [X] T014 [US2] Product page: breadcrumb, zoomable media, specs list, service notes
- [X] T015 [US2] Enquiry form and thank-you restyle
- [X] T016 [US2] Category and search page headers; empty and error states

## Phase 5: US4: Motion and polish

- [X] T017 [US4] Page transitions and scroll reveals; reduced-motion overrides
- [X] T018 Separate always-light `--color-panel` tokens for dark mode
- [X] T019 Fix: mobile menu items lost their side gutters
- [X] T020 Scope tests where featured products now appear twice (hero + grid)
- [X] T021 Verify at 1440px, a narrower desktop width, tablet and 375px, light + dark; full enquiry flow
- [X] T022 Remove unused styles; typecheck, tests, build
