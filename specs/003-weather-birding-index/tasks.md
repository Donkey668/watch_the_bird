# Tasks: Analysis Weather and Birding Index

**Input**: Design documents from `/specs/003-weather-birding-index/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
specification and quickstart require manual API/UI validation for default load,
park switching, degraded states, and rapid-selection behavior.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Route Handlers**: `app/api/**/route.ts`
- **App routes**: `app/**/page.tsx`, `app/**/layout.tsx`
- **Feature-local UI**: `app/_components/`
- **Shared UI primitives**: `components/ui/`
- **Shared logic**: `lib/**`
- **Feature docs**: `specs/003-weather-birding-index/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, environment placeholders, and park metadata
needed by the weather and birding-outlook feature.

- [X] T001 Remove the obsolete `openai` dependency from `package.json`
- [X] T002 Add the required `AMAP_WEATHER_KEY` placeholder in `.env.example`
- [X] T003 [P] Extend preset park metadata with district lookup fields in `lib/maps/park-options.ts`
- [X] T004 [P] Extend environment verification to require weather server vars only in `scripts/verify-amap-env.mjs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared server and UI foundations required by every user
story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Define birding-index enums, response types, and normalization helpers in `lib/weather/birding-outlook.ts`
- [X] T006 [P] Implement AMap weather URL composition and JSON parsing helpers in `lib/weather/amap-weather.ts`
- [X] T007 [P] Implement the local weighted birding-index scoring tables, parsing helpers, and failure handling in `lib/ai/birding-index.ts`
- [X] T008 Create `GET /api/analysis/birding-outlook` query validation and shared response shaping in `app/api/analysis/birding-outlook/route.ts`
- [X] T009 [P] Create the weather and birding outlook panel shell with loading and error containers in `app/_components/analysis-birding-outlook.tsx`
- [X] T010 Wire the new panel below the map with width-safe spacing in `app/_components/analysis-screen.tsx` and `app/globals.css`

**Checkpoint**: Foundation ready; the outlook API surface and panel shell exist
for story implementation.

---

## Phase 3: User Story 1 - View The Current Park Outlook (Priority: P1) MVP

**Goal**: Show today's district weather and one supported birding index value
for the default park directly below the map.

**Independent Test**: Open `/` in a portrait mobile viewport and confirm the
default park automatically loads a panel that shows district weather details
and exactly one birding index value from `适宜`, `较适宜`, or `不适宜`.

- [X] T011 [P] [US1] Implement the full-success route flow that resolves the default park context, fetches district weather, and computes a birding index in `app/api/analysis/birding-outlook/route.ts`
- [X] T012 [US1] Fetch the default park outlook on mount and manage loading-to-success transitions in `app/_components/analysis-birding-outlook.tsx`
- [X] T013 [US1] Render the district header, highlighted birding index, and all normalized weather fields in `app/_components/analysis-birding-outlook.tsx`
- [X] T014 [US1] Replace the placeholder analysis content ordering so the outlook panel is the first data card under the map in `app/_components/analysis-screen.tsx`

**Checkpoint**: User Story 1 is complete when the default park renders a usable
weather-plus-index panel without leaving the analysis screen.

---

## Phase 4: User Story 2 - Refresh Results When Switching Parks (Priority: P2)

**Goal**: Keep the outlook panel synchronized with the currently selected map
park without a full-page refresh.

**Independent Test**: Switch among all preset parks from the map selector and
confirm the panel refreshes to the matching park and district context each time
without reloading the page.

- [X] T015 [P] [US2] Add controlled `parkId` and `onParkChange` support to `app/_components/analysis-map-panel.tsx`
- [X] T016 [US2] Lift active park selection into `app/_components/analysis-screen.tsx` and pass it to the map and outlook panels
- [X] T017 [US2] Refetch the outlook whenever the selected `parkId` changes without a full-page reload in `app/_components/analysis-birding-outlook.tsx`
- [X] T018 [US2] Keep park and district labels synchronized across switched responses in `app/api/analysis/birding-outlook/route.ts` and `app/_components/analysis-birding-outlook.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when park switching updates
the panel deterministically and keeps the map screen in place.

---

## Phase 5: User Story 3 - Stay Clear Under Errors And Rapid Switching (Priority: P3)

**Goal**: Preserve understandable, latest-selection-only results when weather
or local scoring steps fail or when users switch parks quickly.

**Independent Test**: Rapidly switch parks and simulate weather failure plus
local-scoring failure; verify the panel shows only the latest selection's
result or a clear degraded state without stale birding-index text.

- [X] T019 [P] [US3] Reject invalid weather upstream results and return the `failed` API state in `lib/weather/amap-weather.ts` and `app/api/analysis/birding-outlook/route.ts`
- [X] T020 [P] [US3] Reject unsupported or unavailable local scoring inputs and return the `partial` API state in `lib/ai/birding-index.ts` and `app/api/analysis/birding-outlook/route.ts`
- [X] T021 [P] [US3] Add final-selection-wins request sequencing for rapid park changes in `app/_components/analysis-birding-outlook.tsx`
- [X] T022 [US3] Render partial-success, failure, and retry-only panel states without stale birding results in `app/_components/analysis-birding-outlook.tsx`
- [X] T023 [US3] Preserve panel width safety and keep map interaction unobstructed under degraded states in `app/_components/analysis-screen.tsx` and `app/globals.css`

**Checkpoint**: All user stories are complete when degraded states remain clear
and the last park selection always wins on screen.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, cleanup, and manual validation across the
feature.

- [X] T024 [P] Align environment setup and validation steps with weather and local-scoring requirements in `specs/003-weather-birding-index/quickstart.md`
- [X] T025 [P] Align final API and UI examples with implemented loading, partial, and failure copy in `specs/003-weather-birding-index/contracts/analysis-birding-outlook-api-contract.md` and `specs/003-weather-birding-index/contracts/analysis-birding-outlook-ui-contract.md`
- [X] T026 Run lint-oriented cleanup for `app/api/analysis/birding-outlook/route.ts`, `app/_components/analysis-birding-outlook.tsx`, `app/_components/analysis-screen.tsx`, `app/_components/analysis-map-panel.tsx`, `lib/weather/amap-weather.ts`, `lib/weather/birding-outlook.ts`, `lib/ai/birding-index.ts`, `lib/maps/park-options.ts`, and `scripts/verify-amap-env.mjs`
- [ ] T027 Run the manual validation flow and record implementation notes in `specs/003-weather-birding-index/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and the default-outlook baseline from US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and the park-switching flow from US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: No dependency on other user stories once foundational work is complete
- **US2**: Builds on the panel and API baseline created for US1
- **US3**: Builds on US2 request/selection synchronization and extends degraded-state handling

### Within Each User Story

- Complete server-side normalization before wiring UI rendering to it
- Establish the route handler response states before refining panel state transitions
- Lift park-selection state before expecting switch-driven refetch behavior
- Add degraded-state rendering after partial and failed API states are defined

### Parallel Opportunities

- T003 and T004 can run in parallel during Setup
- T005, T006, T007, and T009 can run in parallel during Foundational
- T011 can run in parallel with T012 during US1
- T015 can run in parallel with route-side synchronization work in T018 during US2
- T019, T020, and T021 can run in parallel during US3
- T024 and T025 can run in parallel during Polish

---

## Parallel Example: User Story 1

```bash
Task: "Implement the full-success route flow that resolves the default park context, fetches district weather, and computes a birding index in app/api/analysis/birding-outlook/route.ts"
Task: "Fetch the default park outlook on mount and manage loading-to-success transitions in app/_components/analysis-birding-outlook.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add controlled parkId and onParkChange support to app/_components/analysis-map-panel.tsx"
Task: "Keep park and district labels synchronized across switched responses in app/api/analysis/birding-outlook/route.ts and app/_components/analysis-birding-outlook.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Reject invalid weather upstream results and return the failed API state in lib/weather/amap-weather.ts and app/api/analysis/birding-outlook/route.ts"
Task: "Reject unsupported or unavailable local scoring inputs and return the partial API state in lib/ai/birding-index.ts and app/api/analysis/birding-outlook/route.ts"
Task: "Add final-selection-wins request sequencing for rapid park changes in app/_components/analysis-birding-outlook.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the default park outlook in portrait mobile view
5. Stop for review before adding switching and degraded-state behavior

### Incremental Delivery

1. Deliver the default outlook experience for the initial park (US1)
2. Add park-switch synchronization with no-refresh updates (US2)
3. Add degraded-state resilience and latest-selection guards (US3)
4. Finish documentation, cleanup, and manual validation (Phase 6)

### Suggested MVP Scope

- T001-T014 deliver the smallest complete increment for the weather and
  birding-index experience below the map.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend work is routed exclusively through `app/api/analysis/birding-outlook/route.ts`
- Frontend tasks assume Tailwind CSS + shadcn/ui composition only
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
