# Feature Specification: Product catalogue MVP

**Folder:** `specs/001-product-catalogue`
**Created:** 2026-11-03 · **Status:** Implemented
**Input:** "A product catalogue on web or mobile. Customers will search and browse the catalogue
and submit an enquiry for products they want." (Code Challenge: AI-Native Engineer brief)

> Written retroactively from the brief and the implemented behaviour, so that future work
> starts from a spec (Constitution principle I).

## User scenarios & testing

### User story 1: Featured products on the home page (Priority: P1)

The entrepreneur hand-picks five "top rated" products, and a visitor sees them as soon as they
arrive, so the best of the catalogue is the first impression.

**Why this priority:** it's the landing experience and the entrepreneur's main merchandising lever.

**Independent test:** configure five product ids, open the home page, and see exactly those
five in that order.

**Acceptance scenarios:**

1. **GIVEN** I have chosen 5 products to be "top rated" **WHEN** I am viewing the home page
   **THEN** I see those 5 featured products.
2. **GIVEN** a chosen product no longer exists **WHEN** the home page loads **THEN** the remaining
   products are shown and the missing one is logged, not shown as an error.

### User story 2: Browse a category (Priority: P1)

A visitor opens a category and sees its best-rated products first, then everything else in it.

**Independent test:** open any category and check that the top-rated section is ordered by
rating and that every product in the category appears exactly once.

**Acceptance scenarios:**

1. **GIVEN** my products are organised into categories **WHEN** I click on a category link
   **THEN** I see top rated products for that category **AND** I see additional products in that category.
2. **GIVEN** I'm viewing the additional products **WHEN** I choose a sort order **THEN** they
   re-order, and the choice survives a page refresh.
3. **GIVEN** a category does not exist **WHEN** I open its address **THEN** I see a clear "not found" message.

### User story 3: Search (Priority: P1)

A visitor looking for something specific types a term and gets only matching products.

**Acceptance scenarios:**

1. **GIVEN** I am looking for a specific product **AND** I have entered a search term in the
   search bar **WHEN** I click the search button **THEN** I only see products that have text
   matching that search term.
2. **GIVEN** nothing matches **WHEN** I search **THEN** I'm told so, with a suggestion to try
   another term.
3. **GIVEN** the search box is empty **THEN** the search button is disabled.

### User story 4: Product details (Priority: P1)

**Acceptance scenarios:**

1. **GIVEN** I am browsing the products **AND** I want to see more details about a specific
   product **WHEN** I click on a product tile **THEN** I see the product details page.

### User story 5: Enquire about a product (Priority: P1)

A visitor interested in a product leaves their contact details, and the sales team is emailed.

**Acceptance scenarios:**

1. **GIVEN** I am viewing a product **AND** I am interested **AND** I click the Enquire button
   **AND** I complete the form with my contact details **WHEN** I submit the form
   **THEN** the sales inbox receives an email **AND** I see a "Thank you" message.
2. **GIVEN** I leave out my name or enter an invalid email **WHEN** I submit **THEN** I see
   which field to fix, and nothing is sent.
3. **GIVEN** the email provider is down **WHEN** I submit a valid enquiry **THEN** I still see
   "Thank you", and the enquiry is kept and marked as not yet emailed.

### Edge cases

- The product data source is slow or down: the visitor sees a friendly error with "Try again",
  never a technical message.
- A bot fills in the hidden honeypot field: it's told "success", but nothing is stored or sent.
- Someone submits many enquiries quickly: after five a minute from one address they're asked to wait.
- A customer types HTML or line breaks into the form: it's shown as plain text in the email,
  and can't add email headers.

## Requirements

### Functional requirements

- **FR-001:** The home page MUST show the configured featured products, in the configured order.
- **FR-002:** Visitors MUST be able to reach every category from any page.
- **FR-003:** A category page MUST show its top-rated products (by average rating, ties broken
  by review count) followed by its remaining products, each product exactly once.
- **FR-004:** Search MUST run only when the visitor submits it, and MUST return only products
  whose title, description or category contains every word of the term, ignoring case.
- **FR-005:** Clicking a product MUST open a page with its full details.
- **FR-006:** The enquiry form MUST collect name and email (required), phone and message (optional).
- **FR-007:** Each valid enquiry MUST be stored, and MUST be emailed to the sales inbox with the
  customer as reply-to.
- **FR-008:** The visitor MUST see a "Thank you" message after a valid submission.
- **FR-009:** The client MUST NOT call the product data source directly; all product data goes
  through the backend.
- **FR-010:** The product data source, look and feel and email provider MUST each be replaceable
  without changing the rest of the system.

### Key entities

- **Product:** id, title, description, price (amount + currency), image, category, rating
  (average + count).
- **Category:** URL-safe slug and display name. Shown with its product count and preview images.
- **Enquiry:** who (name, email, optional phone), what (product, optional message), when, and
  whether the sales email was sent.

## Success criteria

- **SC-001:** All five acceptance criteria from the brief are covered by automated tests.
- **SC-002:** A reviewer can run the solution locally in under ten minutes with only Node.js.
- **SC-003:** No enquiry is lost when the email provider fails.
- **SC-004:** The product data source can be replaced by writing one adapter, with no change to
  routes, contract or client. (Proven when the hosted demo switched to a snapshot source.)

## Assumptions

- "Chosen" featured products are hand-picked by configuration, not computed from ratings.
- "Top rated" within a category *is* computed: the top 3 by rating.
- Prices are in USD (the source has no currency).
- A failed email still shows "Thank you", because the lead is stored and can be re-sent.

## Out of scope

- An admin interface for choosing featured products (needs authentication; configuration covers the criterion).
- Pagination (the catalogue has 20 products).
- Accounts, carts and checkout.

## Clarifications

### Session 2026-11-03

- Q: What counts as "matching" in search? → A: case-insensitive; every word must appear in the
  title, description or category.
- Q: What if the email fails? → A: keep the enquiry, mark it `failed`, still thank the customer.
- Q: Which fields are required on the enquiry form? → A: name and email only.
