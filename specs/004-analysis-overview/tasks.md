# Tasks: 分析总览核心信息

**Input**: Design documents from `/specs/004-analysis-overview/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
specification and quickstart require `npm run lint`、`npx tsc --noEmit` and
focused manual validation of Beijing time formatting, time-window rules, month
mapping, partial-unavailable behavior, and mobile layout.

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
- **Feature docs**: `specs/004-analysis-overview/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the new overview feature files and keep the implementation
scoped to the existing single-request analysis flow.

- [X] T001 Create the overview feature file shells in `lib/time/beijing-time.ts`, `lib/analysis/analysis-overview.ts`, and `app/_components/analysis-overview-panel.tsx`
- [X] T002 [P] Confirm the overview continues to reuse the existing analysis request path in `app/api/analysis/birding-outlook/route.ts` and `app/_components/analysis-birding-outlook.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared types, helpers, and component boundaries required
before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Extend normalized response types with `analysisOverview` entities in `lib/weather/birding-outlook.ts`
- [X] T004 [P] Define the Beijing-time helper interface and parsing utilities in `lib/time/beijing-time.ts`
- [X] T005 [P] Define the overview derivation interface for habitat activity, migration signal, and observation confidence in `lib/analysis/analysis-overview.ts`
- [X] T006 [P] Create the `AnalysisOverviewPanel` prop contract and loading shell in `app/_components/analysis-overview-panel.tsx`
- [X] T007 Wire `app/_components/analysis-birding-outlook.tsx` to own the overview panel render slot below the weather card without adding a second client fetch

**Checkpoint**: Foundation ready; the API shape and UI boundary for the new
overview panel exist.

---

## Phase 3: User Story 1 - 查看有意义的分析总览 (Priority: P1) MVP

**Goal**: Replace the placeholder overview content with a real “分析总览”
section that shows Beijing time plus three core information rows.

**Independent Test**: Open `/` in a portrait mobile viewport and confirm the
weather/birding panel is followed by one `分析总览` block that no longer shows
`观鸟指数分析`、`今日概览` or placeholder summary copy.

- [X] T008 [P] [US1] Remove the placeholder snapshot constants and placeholder overview cards from `app/_components/analysis-screen.tsx`
- [X] T009 [P] [US1] Implement the real overview panel layout and Simplified Chinese copy in `app/_components/analysis-overview-panel.tsx`
- [X] T010 [US1] Pass `analysisOverview` from the shared outlook response into `app/_components/analysis-overview-panel.tsx` inside `app/_components/analysis-birding-outlook.tsx`
- [X] T011 [US1] Preserve the final panel ordering as map -> weather与观鸟指数 -> 分析总览 in `app/_components/analysis-screen.tsx` and `app/_components/analysis-birding-outlook.tsx`

**Checkpoint**: User Story 1 is complete when the analysis page shows a real
overview block instead of placeholder titles and summary text.

---

## Phase 4: User Story 2 - 基于当前时段与季节获得即时判断 (Priority: P2)

**Goal**: Derive habitat activity and migration signal from current Beijing
time, current month, and the existing birding index result.

**Independent Test**: Validate multiple controlled Beijing times and months,
and confirm the overview returns the correct habitat activity and migration
signal without showing a visible `当前时段` label.

- [X] T012 [P] [US2] Implement Beijing time formatting as `YYYY年M月D日 HH:mm` plus internal month/minute extraction in `lib/time/beijing-time.ts`
- [X] T013 [P] [US2] Implement the habitat-activity time-window rules and migration-signal month mapping in `lib/analysis/analysis-overview.ts`
- [X] T014 [US2] Extend success and partial-success response shaping to include `analysisOverview` in `app/api/analysis/birding-outlook/route.ts` and `lib/weather/birding-outlook.ts`
- [X] T015 [US2] Render the formatted Beijing time and suppress any explicit current-time-slot label in `app/_components/analysis-overview-panel.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when the overview shows
correct Beijing-time-driven values with no visible time-slot label.

---

## Phase 5: User Story 3 - 在边界和部分不可用场景下保持清晰 (Priority: P3)

**Goal**: Keep the overview deterministic at boundary times and understandable
when the birding index is unavailable.

**Independent Test**: Validate the boundary times `06:00`、`09:00`、`12:00`、
`14:00`、`16:00`、`18:00`, plus a partial-success response where habitat
activity must render `暂不可用` while the other rows remain visible.

- [X] T016 [P] [US3] Implement boundary-time handling and overnight window resolution in `lib/time/beijing-time.ts` and `lib/analysis/analysis-overview.ts`
- [X] T017 [P] [US3] Implement the partial-success habitat fallback value `暂不可用` in `lib/analysis/analysis-overview.ts` and `lib/weather/birding-outlook.ts`
- [X] T018 [US3] Render the unavailable habitat row while preserving migration signal and observation confidence in `app/_components/analysis-overview-panel.tsx`
- [X] T019 [US3] Prevent stale overview output during failed or superseded requests in `app/_components/analysis-birding-outlook.tsx` and `app/_components/analysis-overview-panel.tsx`

**Checkpoint**: All user stories are complete when the overview remains correct
at time boundaries and clear under partial-unavailable conditions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align docs, cleanup, and final validation across the feature.

- [X] T020 [P] Align the final overview response examples and UI expectations in `specs/004-analysis-overview/contracts/analysis-overview-api-contract.md` and `specs/004-analysis-overview/contracts/analysis-overview-ui-contract.md`
- [X] T021 [P] Run lint-oriented cleanup for `app/api/analysis/birding-outlook/route.ts`, `app/_components/analysis-birding-outlook.tsx`, `app/_components/analysis-overview-panel.tsx`, `app/_components/analysis-screen.tsx`, `lib/analysis/analysis-overview.ts`, `lib/time/beijing-time.ts`, and `lib/weather/birding-outlook.ts`
- [ ] T022 Run the manual validation flow and record implementation notes in `specs/004-analysis-overview/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and extends the overview with rule-driven values
- **User Story 3 (Phase 5)**: Depends on Foundational completion and hardens the rule-driven overview for boundary and partial states
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Can start once the overview response shape and panel boundary exist
- **US2**: Builds on the US1 overview surface and adds Beijing-time and month-based derivation
- **US3**: Builds on US2 derivation logic and extends it for edge and partial-unavailable behavior

### Within Each User Story

- Extend shared response types before relying on the new overview payload in UI
- Keep one client request path; do not introduce a second overview fetch
- Finalize overview derivation before polishing the visible row text
- Apply degraded-state rendering only after partial-success route shaping exists

### Parallel Opportunities

- T002 can run in parallel with T001 during Setup
- T003, T004, T005, and T006 can run in parallel during Foundational
- T008 and T009 can run in parallel during US1
- T012 and T013 can run in parallel during US2
- T016 and T017 can run in parallel during US3
- T020 and T021 can run in parallel during Polish

---

## Parallel Example: User Story 1

```bash
Task: "Remove the placeholder snapshot constants and placeholder overview cards from app/_components/analysis-screen.tsx"
Task: "Implement the real overview panel layout and Simplified Chinese copy in app/_components/analysis-overview-panel.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Implement Beijing time formatting as YYYY年M月D日 HH:mm plus internal month/minute extraction in lib/time/beijing-time.ts"
Task: "Implement the habitat-activity time-window rules and migration-signal month mapping in lib/analysis/analysis-overview.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Implement boundary-time handling and overnight window resolution in lib/time/beijing-time.ts and lib/analysis/analysis-overview.ts"
Task: "Implement the partial-success habitat fallback value 暂不可用 in lib/analysis/analysis-overview.ts and lib/weather/birding-outlook.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete the rule-derivation tasks in Phase 4
5. **STOP and VALIDATE**: Verify the overview shows the correct Beijing time and three core rows before edge-case hardening

### Incremental Delivery

1. Establish the overview response shape and panel shell
2. Replace placeholder overview content with the real panel (US1)
3. Add Beijing-time and month-based derivation (US2)
4. Add boundary and partial-unavailable behavior (US3)
5. Finish docs alignment, cleanup, and manual validation (Phase 6)

### Suggested MVP Scope

- T001-T015 deliver the smallest complete increment that replaces the
  placeholder overview with a rule-driven Beijing-time summary.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend work remains behind `app/api/analysis/birding-outlook/route.ts`
- Frontend work should continue to prefer Tailwind CSS + shadcn/ui composition
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
