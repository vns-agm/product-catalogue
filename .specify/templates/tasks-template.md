# Tasks: [FEATURE NAME]

**Spec:** [`spec.md`](./spec.md) · **Plan:** [`plan.md`](./plan.md)

> Tasks are ordered. `[P]` marks tasks that can run in parallel (different files, no shared
> dependency). `[US1]` links a task to a user story. Write the test **before** the code it covers,
> and watch it fail first.
>
> Format: `- [ ] T001 [P] [US1] Description in path/to/file.ts`

## Phase 1: Setup

- [ ] T001 [description and path]

## Phase 2: Foundations (blocks all user stories)

- [ ] T002 [shared types, config, boundaries]

## Phase 3: User story 1 (P1): [title]

**Goal:** [what this story delivers] · **Independent test:** [how to verify it alone]

- [ ] T010 [P] [US1] Test: [behaviour] in [test path]
- [ ] T011 [US1] Implement [behaviour] in [source path]

**Checkpoint:** user story 1 works and is tested on its own.

## Phase 4: User story 2 (P2): [title]

- [ ] T020 [P] [US2] …

## Phase N: Polish & cross-cutting

- [ ] T090 Docs: update README / DECISIONS.md / AI_USAGE.md
- [ ] T091 Verify the constitution's quality gates (typecheck, tests, build, responsive check)

## Dependencies

- Phase 2 blocks every user story.
- [Story-to-story dependencies, if any]
