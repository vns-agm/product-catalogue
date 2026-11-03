# Project documentation

How this repository is organised for spec-driven, AI-assisted development.

```
.
├── .specify/
│   ├── memory/constitution.md     # non-negotiable principles for people and AI agents
│   └── templates/                 # starting points for every new feature
│       ├── spec-template.md       #   what and why
│       ├── plan-template.md       #   how, with a constitution check
│       └── tasks-template.md      #   ordered, checkable work
├── specs/                         # one folder per feature, numbered
│   ├── 001-product-catalogue/     #   the MVP: spec, plan, research, data model, contract, quickstart, tasks
│   └── 002-premium-redesign/      #   the editorial redesign: spec, plan, tasks
├── docs/
│   ├── README.md                  # this file
│   └── style-guide.md             # visual design system and code conventions
├── AGENTS.md                      # operating instructions for AI coding agents
├── DECISIONS.md                   # assumptions, cuts, how it grows, what's next
├── AI_USAGE.md                    # how AI was used and where it went wrong
└── README.md                      # setup, run, test, deploy
```

## Which document answers what

| Question | Read |
| --- | --- |
| What rules can never be broken? | [Constitution](../.specify/memory/constitution.md) |
| What does feature N do, and why? | `specs/NNN-*/spec.md` |
| How was it built, and what was decided? | `specs/NNN-*/plan.md`, `research.md` |
| What does the API accept and return? | [API contract](../specs/001-product-catalogue/contracts/api.md) |
| How should it look, move and read? | [Style guide](./style-guide.md) |
| How do I run and check it? | [README](../README.md), [quickstart](../specs/001-product-catalogue/quickstart.md) |
| What should an AI agent do before changing code? | [AGENTS.md](../AGENTS.md) |

## Workflow for a new feature

1. **Specify:** copy `.specify/templates/spec-template.md` to `specs/NNN-name/spec.md`. Describe
   the what and why, with GIVEN/WHEN/THEN acceptance criteria. Mark unknowns
   `[NEEDS CLARIFICATION]`.
2. **Clarify:** resolve every marker, or turn it into a stated assumption. Log the answers under *Clarifications*.
3. **Plan:** copy the plan template. Fill in the technical context and pass the **Constitution Check**.
   Add `research.md`, `data-model.md` and `contracts/` as needed.
4. **Tasks:** copy the tasks template. Order the work by user story, with tests first.
5. **Implement:** work task by task, ticking each one off. Run `npm run typecheck && npm test`.
6. **Verify:** check the quality gates in the constitution, then update `DECISIONS.md` and `AI_USAGE.md`.
