# Tasks: Watch The Bird Mobile Web Experience

**Input**: Design documents from `/specs/001-watch-bird-mobile/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated test tasks are generated for this feature because the
specification only requires manual mobile viewport validation in `quickstart.md`.

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
- **Feature docs**: `specs/001-watch-bird-mobile/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the Tailwind CSS + shadcn/ui baseline and mobile shell
scaffolding required by all stories.

- [X] T001 Add shadcn/ui support dependencies and scripts in `package.json`
- [X] T002 Create the shared shadcn/ui class name helper in `lib/utils.ts`
- [X] T003 Configure light-theme mobile tokens, body overflow rules, and viewport-safe defaults in `app/globals.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared shell and primitives that all three user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Create reusable shadcn/ui button primitive for navigation controls in `components/ui/button.tsx`
- [X] T005 [P] Create reusable shadcn/ui surface primitives in `components/ui/card.tsx` and `components/ui/separator.tsx`
- [X] T006 [P] Build the fixed three-button top navigation component contract in `app/_components/top-nav.tsx`
- [X] T007 [P] Build the shared screen container and transition frame in `app/_components/screen-frame.tsx`
- [X] T008 Create the interactive mobile shell state, orientation guard, and tab-to-screen mapping in `app/_components/mobile-shell.tsx`
- [X] T009 Connect the root route entry to the mobile shell in `app/page.tsx`

**Checkpoint**: Foundation ready - the route renders through a shared shell with
navigation, orientation handling, and reusable UI primitives in place.

---

## Phase 3: User Story 1 - View The Default Analysis Screen (Priority: P1) MVP

**Goal**: Deliver the default birdwatching index analysis experience with the
left tab active, fixed top bar visible, and vertical-only mobile scrolling.

**Independent Test**: Open `/` in a portrait mobile viewport between 375px and
430px and verify that the analysis screen is shown by default, the left tab is
highlighted, the header stays fixed while content scrolls vertically, and no
horizontal overflow appears.

- [X] T010 [P] [US1] Create the birdwatching index analysis intro screen in `app/_components/analysis-screen.tsx`
- [X] T011 [US1] Wire the default `analysis` active screen state in `app/_components/mobile-shell.tsx`
- [X] T012 [US1] Implement left-tab active and inactive styling semantics in `app/_components/top-nav.tsx`
- [X] T013 [P] [US1] Tune analysis viewport spacing and fixed-header scroll offsets in `app/_components/screen-frame.tsx` and `app/globals.css`

**Checkpoint**: User Story 1 is complete when the app consistently opens on the
analysis view and the mobile shell behaves correctly in portrait mode.

---

## Phase 4: User Story 2 - Switch To The Bird Identification Tool (Priority: P2)

**Goal**: Let users switch from the default analysis screen to the bird
identification tool without a full page refresh and with visible motion feedback.

**Independent Test**: Starting from the default analysis screen, tap the center
tab and verify that the identification tool screen appears with a fade/slide
transition, the center tab becomes active, and the layout still scrolls only
vertically.

- [X] T014 [P] [US2] Create the bird identification intro tool screen in `app/_components/identify-screen.tsx`
- [X] T015 [US2] Add center-tab selection handling and analysis-to-identify transitions in `app/_components/mobile-shell.tsx`
- [X] T016 [US2] Implement center-tab active and inactive styling semantics in `app/_components/top-nav.tsx`
- [X] T017 [P] [US2] Refine identification screen framing and vertical-scroll behavior in `app/_components/identify-screen.tsx` and `app/_components/screen-frame.tsx`

**Checkpoint**: User Story 2 is complete when the identify screen is reachable
via the center tab with correct state updates and smooth in-shell transitions.

---

## Phase 5: User Story 3 - Switch To Personal Observation Records (Priority: P3)

**Goal**: Let users switch to the personal observation records screen with the
same no-refresh navigation behavior and clear empty-state messaging.

**Independent Test**: Starting from any other screen, tap the right tab and
verify that the records screen appears with the same transition behavior, the
right tab becomes active, and the content area continues to scroll vertically.

- [X] T018 [P] [US3] Create the personal observation records intro and empty-state screen in `app/_components/records-screen.tsx`
- [X] T019 [US3] Add right-tab selection handling and records-screen transitions in `app/_components/mobile-shell.tsx`
- [X] T020 [US3] Implement right-tab active and inactive styling semantics in `app/_components/top-nav.tsx`
- [X] T021 [P] [US3] Refine records screen framing, empty-state messaging, and vertical-scroll behavior in `app/_components/records-screen.tsx` and `app/_components/screen-frame.tsx`

**Checkpoint**: User Story 3 is complete when all three screens are reachable
from the fixed top bar and the records screen behaves correctly in portrait mode.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize accessibility, metadata, and validation across the full shell.

- [X] T022 [P] Update route metadata and page naming for Watch The Bird in `app/layout.tsx`
- [X] T023 Add reduced-motion handling and rapid-tap transition guards in `app/_components/mobile-shell.tsx` and `app/_components/top-nav.tsx`
- [X] T024 [P] Refine final light-theme typography and section copy in `app/globals.css`, `app/_components/analysis-screen.tsx`, `app/_components/identify-screen.tsx`, and `app/_components/records-screen.tsx`
- [ ] T025 Run the manual viewport validation flow and update implementation notes in `specs/001-watch-bird-mobile/quickstart.md`
- [X] T026 Run final cleanup and lint-oriented fixes in `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/_components/mobile-shell.tsx`, `app/_components/top-nav.tsx`, and `app/_components/screen-frame.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion; can be tested independently after its own tasks are complete
- **User Story 3 (Phase 5)**: Depends on Foundational completion; can be tested independently after its own tasks are complete
- **Polish (Phase 6)**: Depends on the desired user stories being complete

### User Story Dependencies

- **US1**: No dependency on other user stories once foundational shell work is complete
- **US2**: Uses the shared shell from Phase 2 and can be implemented after foundational work, though it shares `app/_components/mobile-shell.tsx` and `app/_components/top-nav.tsx` with US1
- **US3**: Uses the shared shell from Phase 2 and can be implemented after foundational work, though it shares `app/_components/mobile-shell.tsx` and `app/_components/top-nav.tsx` with US1 and US2

### Within Each User Story

- Shared screen component creation can start before shell integration
- Shell state wiring in `app/_components/mobile-shell.tsx` must happen before the story is fully testable
- Tab visual state updates in `app/_components/top-nav.tsx` must match the visible screen before a story is considered complete
- Screen framing and scroll behavior must be validated before moving to the next priority

### Parallel Opportunities

- T004 and T005 can run in parallel after setup
- T006 and T007 can run in parallel after setup
- Within US1, T010 and T013 can run in parallel
- Within US2, T014 and T017 can run in parallel
- Within US3, T018 and T021 can run in parallel
- T022 and T024 can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
Task: "Create the birdwatching index analysis intro screen in app/_components/analysis-screen.tsx"
Task: "Tune analysis viewport spacing and fixed-header scroll offsets in app/_components/screen-frame.tsx and app/globals.css"
```

## Parallel Example: User Story 2

```bash
Task: "Create the bird identification intro tool screen in app/_components/identify-screen.tsx"
Task: "Refine identification screen framing and vertical-scroll behavior in app/_components/identify-screen.tsx and app/_components/screen-frame.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Create the personal observation records intro and empty-state screen in app/_components/records-screen.tsx"
Task: "Refine records screen framing, empty-state messaging, and vertical-scroll behavior in app/_components/records-screen.tsx and app/_components/screen-frame.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the portrait mobile default analysis experience in the recommended viewports
5. Stop for review before expanding to the other two screens

### Incremental Delivery

1. Build the shell foundation and default analysis experience
2. Add the identify screen and tab-switch interaction
3. Add the records screen and empty-state flow
4. Finish motion, metadata, and manual validation

### Suggested MVP Scope

- T001-T013 deliver the smallest complete increment that satisfies the default
  analysis screen experience and establishes the reusable shell foundation.

---

## Notes

- All tasks follow the required checkbox + ID + label + file path format
- No backend/API or ECharts tasks are included because the current feature scope is frontend-only
- `Tailwind CSS + shadcn/ui` is treated as the default implementation path for all reusable UI
- The main shared-file coordination risk is `app/_components/mobile-shell.tsx` and `app/_components/top-nav.tsx`
