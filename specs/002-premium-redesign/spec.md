# Feature Specification: Premium editorial redesign

**Folder:** `specs/002-premium-redesign`
**Created:** 2026-11-03 · **Status:** Implemented
**Input:** "Elevate the visual design and user experience into a premium, sophisticated product
catalogue: Apple's product presentation, Aesop's editorial aesthetic, high-end e-commerce and
modern SaaS attention to detail. Avoid generic AI dashboard looks, excessive gradients,
glassmorphism, cartoonish icons and overcrowded layouts. Do not break existing functionality."

## User scenarios & testing

### User story 1: A first impression that builds trust (Priority: P1)

A first-time visitor immediately understands what the catalogue offers and feels it is a
quality, trustworthy brand.

**Acceptance scenarios:**

1. **GIVEN** I open the home page on any device **WHEN** it loads **THEN** I see a clear headline,
   a short description, a primary and a secondary call to action, and real product imagery,
   with no placeholder boxes once data has arrived.
2. **GIVEN** I click "Explore the collection" **THEN** I'm taken smoothly to the top-rated products.

### User story 2: Products that feel worth enquiring about (Priority: P1)

**Acceptance scenarios:**

1. **GIVEN** I'm looking at any product list **THEN** each card shows a large, consistently
   proportioned image, the category, name, a short description, price and rating.
2. **GIVEN** I hover over a card (pointer devices) **THEN** the image zooms subtly and a
   "View details" prompt appears.
3. **GIVEN** I open a product **THEN** I can zoom into its image and read its details, and the
   Enquire action is the most prominent control.

### User story 3: Effortless navigation everywhere (Priority: P1)

**Acceptance scenarios:**

1. **GIVEN** a desktop screen **THEN** categories and search are always visible in the header.
2. **GIVEN** a phone **WHEN** I tap the menu button **THEN** a full-width category menu opens,
   and it closes when I choose a page.
3. **GIVEN** any page **THEN** the footer offers category, service and about links.

### User story 4: Calm, intentional motion (Priority: P2)

**Acceptance scenarios:**

1. **GIVEN** I scroll **THEN** sections below the fold ease into view once. Content already on
   screen never waits on an animation.
2. **GIVEN** my system asks for reduced motion **THEN** animations are effectively disabled.

## Requirements

- **FR-001:** A single design system (tokens) defines colour, type, spacing, radius, shadow and motion.
- **FR-002:** Palette: warm ivory background, off-white and light-grey surfaces, near-black text,
  one restrained accent. No decorative gradients or glassmorphism.
- **FR-003:** Typography: an editorial serif for display, a neutral sans for text, with a clear hierarchy.
- **FR-004:** The home page has a hero, curated categories, the top-rated edit, a brand story and a footer. No filler sections.
- **FR-005:** Product images keep fixed proportions, and placeholders match final layouts (no layout shift).
- **FR-006:** Every behaviour from spec 001 keeps working, and its tests keep passing.
- **FR-007:** Accessible: semantic landmarks, labelled controls, visible focus, reduced-motion support.
- **FR-008:** Responsive from 360px phones to large desktops, with no horizontal scrolling.
- **FR-009:** Product cards show a short description, provided by the API so every client shows the same text.
- **FR-010:** No new runtime dependencies.

## Success criteria

- **SC-001:** All 001 tests pass unchanged in intent (only selectors scoped where content now repeats).
- **SC-002:** No horizontal overflow at 375px, verified in the browser.
- **SC-003:** Light and dark modes both meet the style guide's contrast rules.

## Assumptions

- The brand's creative work is still in progress, so this is a high-quality, replaceable
  baseline expressed entirely in tokens.
- Product photography comes from the existing data source. Its white backgrounds are
  presented on light panels in both colour schemes.

## Out of scope

- Custom photography, illustration or a logo mark.
- New routes or features beyond presentation and the card excerpt.
