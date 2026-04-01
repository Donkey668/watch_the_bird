# Tasks: 栖息地鸟种参考

**Input**: Design documents from `/specs/005-park-species-reference/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
design artifacts and quickstart emphasize `npm run lint`, `npx tsc --noEmit`,
`npm run build`, and focused manual validation of preview/full loading, park
switching, modal layering, workbook failure states, and mobile scroll behavior.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Route Handlers**: `app/api/**/route.ts`
- **Feature-local UI**: `app/_components/`
- **Shared UI primitives**: `components/ui/`
- **Shared logic**: `lib/**`
- **Feature docs**: `specs/005-park-species-reference/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and feature file scaffolding for workbook-backed species reference data.

- [X] T001 Add workbook parsing and dialog dependencies in `package.json` and `package-lock.json`
- [X] T002 [P] Create feature file shells in `components/ui/dialog.tsx`, `lib/species/park-species-workbooks.ts`, `lib/species/habitat-species-reference.ts`, `app/api/analysis/habitat-species-reference/route.ts`, and `app/_components/analysis-habitat-species-reference.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared mapping, response contracts, and UI shell required before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Define workbook filename mapping, server path resolution, and source-status helpers in `lib/species/park-species-workbooks.ts`
- [X] T004 [P] Define species reference request/response types, normalized record schema, and shared response builders in `lib/species/habitat-species-reference.ts`
- [X] T005 [P] Implement the shared shadcn dialog primitive in `components/ui/dialog.tsx`
- [X] T006 [P] Create the species reference component props, loading shell, and scoped empty/error state surface in `app/_components/analysis-habitat-species-reference.tsx`
- [X] T007 Wire `app/_components/analysis-screen.tsx` to reserve the species reference slot below the current analysis content and above `如何使用本页面`

**Checkpoint**: Foundation ready; workbook lookup, response shaping, dialog primitive, and page slot all exist.

---

## Phase 3: User Story 1 - 查看当前公园的鸟种参考预览 (Priority: P1) MVP

**Goal**: Show a park-linked preview list of up to 10 bird species cards below the existing analysis modules.

**Independent Test**: Open `/` in a portrait mobile viewport, keep any preset park selected, and confirm the analysis page shows a `栖息地鸟种参考` module with up to 10 preview cards containing `序号`、`鸟种名称`、`居留类型`、`保护级别`.

- [X] T008 [P] [US1] Implement workbook row parsing, required field normalization, and preview slicing in `lib/species/habitat-species-reference.ts`
- [X] T009 [US1] Implement preview Route Handler behavior for `parkId` validation and `view=preview` responses in `app/api/analysis/habitat-species-reference/route.ts`
- [X] T010 [P] [US1] Build the preview card list, Chinese header copy, and vertically scrollable card layout in `app/_components/analysis-habitat-species-reference.tsx`
- [X] T011 [US1] Integrate the new module into `app/_components/analysis-screen.tsx` and fetch preview data based on the selected `parkId`

**Checkpoint**: User Story 1 is complete when the analysis page shows a park-synced preview list without leaving the analysis flow.

---

## Phase 4: User Story 2 - 查看单条鸟种的详细说明 (Priority: P2)

**Goal**: Let users tap any preview card and read ecological traits and observation difficulty in a top-layer modal.

**Independent Test**: Tap any species card from the preview list and confirm a top-layer modal appears above all page chrome and shows `生态特征` and `观测难度` on separate lines.

- [X] T012 [P] [US2] Normalize ecological-traits and observation-difficulty fallback values for detail display in `lib/species/habitat-species-reference.ts`
- [X] T013 [US2] Extend route response shaping so each species record includes modal-ready detail fields in `app/api/analysis/habitat-species-reference/route.ts`
- [X] T014 [P] [US2] Build the top-layer detail modal with shadcn dialog, Chinese labels, and portal-safe layering in `app/_components/analysis-habitat-species-reference.tsx`
- [X] T015 [US2] Connect card taps, modal open/close flows, and detail rendering in `app/_components/analysis-habitat-species-reference.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when preview cards open a readable, correctly layered detail modal.

---

## Phase 5: User Story 3 - 按需完整查看鸟种记录并保持可读体验 (Priority: P3)

**Goal**: Support full workbook loading on demand while keeping list browsing smooth and free of stale data across park changes.

**Independent Test**: For a park with more than 10 records, confirm the preview shows `点击查看全部信息`, tapping it loads the full list, and the list keeps smooth vertical browsing without stale cards after park switches.

- [X] T016 [P] [US3] Extend collection metadata and view-mode helpers for preview/full responses in `lib/species/habitat-species-reference.ts`
- [X] T017 [US3] Implement `view=full`, empty, missing, and unreadable source handling in `app/api/analysis/habitat-species-reference/route.ts` and `lib/species/park-species-workbooks.ts`
- [X] T018 [P] [US3] Add the `点击查看全部信息` action, scoped full-load state, and conditional button behavior in `app/_components/analysis-habitat-species-reference.tsx`
- [X] T019 [US3] Add native inertia-friendly vertical snap scrolling and stale-request protection for park switches and full loads in `app/_components/analysis-habitat-species-reference.tsx`

**Checkpoint**: All user stories are complete when preview/full loading, park switching, and smooth vertical browsing work together reliably.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align docs, cleanup, and final validation across the feature.

- [X] T020 [P] Align final API/UI examples and workbook assumptions in `specs/005-park-species-reference/contracts/habitat-species-reference-api-contract.md`, `specs/005-park-species-reference/contracts/habitat-species-reference-ui-contract.md`, and `specs/005-park-species-reference/data-model.md`
- [X] T021 [P] Run lint-oriented cleanup for `package.json`, `package-lock.json`, `components/ui/dialog.tsx`, `lib/species/park-species-workbooks.ts`, `lib/species/habitat-species-reference.ts`, `app/api/analysis/habitat-species-reference/route.ts`, `app/_components/analysis-habitat-species-reference.tsx`, and `app/_components/analysis-screen.tsx`
- [ ] T022 Run the manual validation flow and record workbook-specific implementation notes in `specs/005-park-species-reference/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and builds on the preview surface from US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and extends the preview surface with full-load and motion behavior
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Can start once workbook mapping, shared response builders, and the page slot exist
- **US2**: Builds on the US1 card list so there is a surface to tap for detail viewing
- **US3**: Builds on the US1 preview flow and extends it with full-load, empty/error distinctions, and smoother scrolling behavior

### Within Each User Story

- Shared request/response types before Route Handler behavior
- Route Handler behavior before frontend data integration
- Card list rendering before card-detail modal interactions
- Preview loading before full-load expansion
- Full-load action before stale-request and smooth-scroll hardening

### Parallel Opportunities

- T002 can run in parallel with T001 during Setup
- T003, T004, T005, and T006 can run in parallel during Foundational
- T008 and T010 can run in parallel during US1
- T012 and T014 can run in parallel during US2
- T016 and T018 can run in parallel during US3
- T020 and T021 can run in parallel during Polish

---

## Parallel Example: User Story 1

```bash
Task: "Implement workbook row parsing, required field normalization, and preview slicing in lib/species/habitat-species-reference.ts"
Task: "Build the preview card list, Chinese header copy, and vertically scrollable card layout in app/_components/analysis-habitat-species-reference.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Normalize ecological-traits and observation-difficulty fallback values for detail display in lib/species/habitat-species-reference.ts"
Task: "Build the top-layer detail modal with shadcn dialog, Chinese labels, and portal-safe layering in app/_components/analysis-habitat-species-reference.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Extend collection metadata and view-mode helpers for preview/full responses in lib/species/habitat-species-reference.ts"
Task: "Add the 点击查看全部信息 action, scoped full-load state, and conditional button behavior in app/_components/analysis-habitat-species-reference.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify the preview list renders the current park’s bird species cards correctly before adding modal and full-load behavior

### Incremental Delivery

1. Establish dependency, workbook mapping, and response foundations
2. Deliver the preview list module for the current park (US1)
3. Add modal-based detail viewing on top of the preview surface (US2)
4. Add full workbook loading, richer empty/error handling, and smooth scroll behavior (US3)
5. Finish docs alignment, cleanup, and manual validation (Phase 6)

### Suggested MVP Scope

- T001-T011 deliver the smallest complete increment that adds the habitat species preview module to the analysis page.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend work remains behind `app/api/analysis/habitat-species-reference/route.ts`
- Frontend work should continue to prefer Tailwind CSS + shadcn/ui composition
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
