# Implementation Plan: [FEATURE NAME]

**Spec:** [`spec.md`](./spec.md) · **Date:** [DATE] · **Status:** Draft | Approved | Done

> The **how**. Every decision here must trace back to a requirement in `spec.md`
> and pass the Constitution Check below.

## Summary

[The primary requirement and the chosen technical approach, in two or three sentences.]

## Technical context

| | |
| --- | --- |
| **Language / version** | [e.g. TypeScript 5.x, Node 20+] |
| **Primary dependencies** | [existing ones reused; any new one justified below] |
| **Storage** | [e.g. libSQL, or N/A] |
| **Testing** | [e.g. Vitest + Supertest, Testing Library] |
| **Target platform** | [e.g. modern browsers, Vercel serverless, AWS-compatible] |
| **Performance goals** | [e.g. first content in < 1s on broadband] |
| **Constraints** | [e.g. no new runtime dependency, no paid services locally] |
| **Scale / scope** | [e.g. ~20 products, 4 categories] |

## Constitution check

*Gate: must pass before research, and be re-checked after design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Spec before code | ☐ | |
| II. Boundaries are the product | ☐ | |
| III. Contract first, type-only | ☐ | |
| IV. Test the critical path | ☐ | |
| V. Secure and honest by default | ☐ | |
| VI. Runs anywhere, needs nothing | ☐ | |
| VII. Considered design | ☐ | |
| VIII. AI-assisted, human-owned | ☐ | |

## Project structure

### Documentation (this feature)

```
specs/[NNN-feature-name]/
├── spec.md          # what and why
├── plan.md          # this file
├── research.md      # decisions and alternatives considered
├── data-model.md    # entities and validation rules
├── quickstart.md    # how to run and verify the feature
├── contracts/       # API contracts touched by this feature
└── tasks.md         # ordered, checkable work items
```

### Source code (files this feature touches)

```
[list the real paths, e.g. apps/api/src/catalogue/…]
```

## Research & decisions

See [`research.md`](./research.md). Summarise the key decisions here.

## Design

- **Data model:** see [`data-model.md`](./data-model.md)
- **Contracts:** see [`contracts/`](./contracts/)
- **UI:** [screens and states; reference `docs/style-guide.md`]

## Complexity tracking

*Only fill in if the Constitution Check has an exception.*

| Exception | Why it's needed | Simpler alternative rejected because | Removed when |
| --- | --- | --- | --- |
