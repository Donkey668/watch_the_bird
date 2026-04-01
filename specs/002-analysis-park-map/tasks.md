# Tasks: Analysis Park Map Selector

**Input**: Design documents from `/specs/002-analysis-park-map/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated test tasks are generated for this feature because the
specification requires manual viewport and interaction validation in
`quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **App routes**: `app/**/page.tsx`, `app/**/layout.tsx`
- **Feature-local UI**: `app/_components/`
- **Shared UI primitives**: `components/ui/`
- **Shared logic**: `lib/**`
- **Feature docs**: `specs/002-analysis-park-map/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare map dependency and shared configuration files.

- [X] T001 Add AMap loader dependency and map-related scripts in `package.json`
- [X] T002 Add AMap environment variable placeholders in `.env.example`
- [X] T003 [P] Create preset municipal park dataset with default selection in `lib/maps/park-options.ts`
- [X] T004 [P] Create secure AMap loader wrapper and runtime guard in `lib/maps/amap-loader.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared map UI and baseline integration points used by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Add shadcn/ui select primitive for map dropdown control in `components/ui/select.tsx`
- [X] T006 [P] Add map panel sizing and overflow-safe layout tokens in `app/globals.css`
- [X] T007 Create base map panel client component with mount container and refs in `app/_components/analysis-map-panel.tsx`
- [X] T008 Wire analysis screen to render map panel below fixed top bar in `app/_components/analysis-screen.tsx`
- [X] T009 Add map feature-level safety checks for missing key/security config in `lib/maps/amap-loader.ts` and `app/_components/analysis-map-panel.tsx`

**Checkpoint**: Foundation ready - map stories can now be implemented.

---

## Phase 3: User Story 1 - View The Analysis Map Overview (Priority: P1) MVP

**Goal**: Render a horizontal map area below the fixed top bar with width-adaptive layout and initial default park context.

**Independent Test**: Open `/` in portrait mobile viewport and verify the map
block appears under the top bar, stretches to available width, and does not
introduce horizontal overflow.

- [X] T010 [P] [US1] Build map panel frame and top-right control anchor layout in `app/_components/analysis-map-panel.tsx`
- [X] T011 [P] [US1] Initialize AMap instance and default center on first render in `app/_components/analysis-map-panel.tsx`
- [X] T012 [US1] Ensure analysis screen spacing keeps map directly under fixed nav in `app/_components/screen-frame.tsx` and `app/globals.css`
- [X] T013 [US1] Render initial single marker for default park in `app/_components/analysis-map-panel.tsx`

**Checkpoint**: User Story 1 is complete when the default map overview is visible and layout-safe in target widths.

---

## Phase 4: User Story 2 - Switch Parks From Dropdown (Priority: P2)

**Goal**: Let users choose among the four preset parks and update map center/marker without page refresh.

**Independent Test**: In analysis view, select each park from dropdown and
confirm map center and marker update to the chosen park with no full-page reload.

- [X] T014 [P] [US2] Populate dropdown with Shenzhen Bay, Shenzhen East Lake, Bijia Mountain, and Fairy Lake options in `app/_components/analysis-map-panel.tsx` and `lib/maps/park-options.ts`
- [X] T015 [US2] Implement park selection handler to recenter map in `app/_components/analysis-map-panel.tsx`
- [X] T016 [US2] Replace marker on each selection to keep a single active marker in `app/_components/analysis-map-panel.tsx`
- [X] T017 [US2] Sync selector value with active map state and accessibility labels in `app/_components/analysis-map-panel.tsx`
- [X] T018 [US2] Validate analysis page integration remains no-refresh during park switching in `app/_components/analysis-screen.tsx` and `app/_components/mobile-shell.tsx`

**Checkpoint**: User Story 2 is complete when all four parks can be switched reliably with consistent map state.

---

## Phase 5: User Story 3 - Preserve Correct State Under Errors And Rapid Input (Priority: P3)

**Goal**: Keep final selection deterministic and provide usable fallback behavior when map availability is degraded.

**Independent Test**: Rapidly switch selections and simulate map load failures;
verify final state matches last selection and fallback messaging appears while
selector remains visible.

- [X] T019 [P] [US3] Implement final-selection-wins state guard for rapid input in `app/_components/analysis-map-panel.tsx`
- [X] T020 [P] [US3] Add map unavailable fallback message while preserving dropdown visibility in `app/_components/analysis-map-panel.tsx`
- [X] T021 [US3] Handle AMap load/runtime errors and recovery transitions in `app/_components/analysis-map-panel.tsx`
- [X] T022 [US3] Prevent duplicate marker artifacts during fast updates in `app/_components/analysis-map-panel.tsx`

**Checkpoint**: User Story 3 is complete when failure and rapid-switch scenarios remain deterministic and understandable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, manual validation, and cleanup across the feature.

- [X] T023 [P] Update map setup and validation instructions in `specs/002-analysis-park-map/quickstart.md`
- [X] T024 [P] Refine map interaction and fallback wording in `specs/002-analysis-park-map/contracts/analysis-map-ui-contract.md`
- [X] T025 Run lint-oriented cleanup for map integration files in `app/_components/analysis-map-panel.tsx`, `app/_components/analysis-screen.tsx`, `lib/maps/amap-loader.ts`, and `lib/maps/park-options.ts`
- [ ] T026 Run the manual viewport and interaction validation flow and record implementation notes in `specs/002-analysis-park-map/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and US1 map baseline
- **User Story 3 (Phase 5)**: Depends on Foundational completion and US2 interaction baseline
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1**: No dependency on other user stories once foundational work is complete
- **US2**: Builds on US1 map panel and map instance lifecycle
- **US3**: Builds on US2 switching logic and map state synchronization

### Within Each User Story

- Build story UI shell before behavior refinements
- Keep map center, marker, and selected option state synchronized
- Complete story-level validation before moving to next story

### Parallel Opportunities

- T003 and T004 can run in parallel during Setup
- T005 and T006 can run in parallel during Foundational
- Within US1, T010 and T011 can run in parallel
- Within US3, T019 and T020 can run in parallel
- T023 and T024 can run in parallel during Polish

---

## Parallel Example: User Story 1

```bash
Task: "Build map panel frame and top-right control anchor layout in app/_components/analysis-map-panel.tsx"
Task: "Initialize AMap instance and default center on first render in app/_components/analysis-map-panel.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Implement final-selection-wins state guard for rapid input in app/_components/analysis-map-panel.tsx"
Task: "Add map unavailable fallback message while preserving dropdown visibility in app/_components/analysis-map-panel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate map placement and width behavior in target portrait viewports
5. Stop for review before adding switching and resilience behavior

### Incremental Delivery

1. Deliver baseline map panel and default location experience (US1)
2. Add preset park switching and marker replacement (US2)
3. Add rapid-input determinism and fallback behavior (US3)
4. Complete documentation and manual validation updates (Phase 6)

### Suggested MVP Scope

- T001-T013 deliver the smallest complete increment for the map layout and
  default-location user value.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- No Route Handler tasks are included because this feature remains frontend-only
- Apache ECharts tasks are omitted because chart scope is explicitly `N/A`
