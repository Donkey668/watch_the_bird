# Tasks: 记录页记事本

**Input**: Design documents from `/specs/007-records-notebook/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
design artifacts and quickstart emphasize `npm run lint`, `npx tsc --noEmit`,
`npm run build`, and focused manual validation of notebook CRUD, mobile dialog
layering, date/time selector behavior, location/map fill, guest interception,
and refresh persistence.

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
- **Feature docs**: `specs/007-records-notebook/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the notebook feature files, local UI primitive, and server
storage directory required by the implementation plan.

- [X] T001 [P] Create notebook feature file shells in `app/_components/records-notebook-panel.tsx`, `app/_components/record-editor-dialog.tsx`, `app/_components/record-map-picker-dialog.tsx`, `app/_components/records-auth-required-dialog.tsx`, `lib/records/notebook.ts`, `lib/records/notebook-presenter.ts`, `lib/records/notebook-repository.ts`, `lib/records/location-resolver.ts`, `lib/auth/session-resolver.ts`, `app/api/records/notebook/route.ts`, `app/api/records/notebook/[recordId]/route.ts`, and `app/api/records/location/resolve/route.ts`
- [X] T002 [P] Create the shadcn-style multiline input primitive and notebook storage placeholder in `components/ui/textarea.tsx` and `data/notebooks/.gitkeep`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared notebook domain model, repository, auth guard,
and records-screen composition required before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Define notebook record types, payload validation, Beijing time helpers, sorting rules, and summary computation in `lib/records/notebook.ts`
- [X] T004 [P] Implement account-scoped storage-key generation, JSON file I/O, and CRUD repository primitives in `lib/records/notebook-repository.ts`
- [X] T005 [P] Implement shared notebook response presenters and Simplified Chinese message builders in `lib/records/notebook-presenter.ts`
- [X] T006 [P] Implement cookie-based assistant-account resolution and auth-required guard helpers in `lib/auth/session-resolver.ts`
- [X] T007 Create records-screen auth-session prop wiring and replace the placeholder card with the notebook container slot in `app/_components/mobile-shell.tsx` and `app/_components/records-screen.tsx`
- [X] T008 [P] Build the notebook panel shell with stats row, separator, loading state, empty state, error state, and centered `新增记录` action in `app/_components/records-notebook-panel.tsx`
- [X] T009 [P] Build the editor dialog shell, discard-confirm shell, and base form layout in `app/_components/record-editor-dialog.tsx` and `components/ui/textarea.tsx`

**Checkpoint**: Foundation ready; the records screen can host notebook content,
and shared data/auth primitives exist for all stories.

---

## Phase 3: User Story 1 - 管理个人观测记录 (Priority: P1) MVP

**Goal**: Let logged-in users view their notebook summary and records, create a
new entry, and delete an existing entry without leaving the `记录` page.

**Independent Test**: Log in, open the `记录` tab, confirm the title block stays
in place, create a valid record from `新增记录`, verify the list and stats
update, then delete that record and verify the counts roll back.

- [X] T010 [US1] Implement `GET /api/records/notebook` and `POST /api/records/notebook` behavior with account-scoped repository access in `app/api/records/notebook/route.ts`
- [X] T011 [US1] Implement `DELETE /api/records/notebook/[recordId]` behavior with auth, not-found, and delete-result responses in `app/api/records/notebook/[recordId]/route.ts`
- [X] T012 [P] [US1] Build logged-in notebook fetching, create-mode open/close state, and delete-confirm state in `app/_components/records-screen.tsx`
- [X] T013 [P] [US1] Render record cards, empty-state messaging, delete confirmation dialog, and `新增记录` trigger wiring in `app/_components/records-notebook-panel.tsx`
- [X] T014 [US1] Wire create-record submission, default Beijing date/time prefill, and post-create/post-delete refresh behavior in `app/_components/record-editor-dialog.tsx` and `app/_components/records-screen.tsx`

**Checkpoint**: User Story 1 is complete when logged-in users can load, add,
and delete notebook records with correct stats and Chinese feedback.

---

## Phase 4: User Story 2 - 编辑完整观测条目 (Priority: P2)

**Goal**: Let logged-in users edit existing records, use scrollable date/time
pickers, and fill the bird point through device location or in-page map
selection.

**Independent Test**: Open an existing record or a new draft, verify the editor
opens above the page, test date/time selection, bird name and note editing,
device-location fill, map-point fill, note-length limits, cancel/discard
confirmation, and confirm save updates the record correctly.

- [X] T015 [P] [US2] Extend notebook validation and repository update helpers for edit mode, coordinates, and 100-character notes in `lib/records/notebook.ts` and `lib/records/notebook-repository.ts`
- [X] T016 [US2] Implement `PATCH /api/records/notebook/[recordId]` update behavior with validation and not-found handling in `app/api/records/notebook/[recordId]/route.ts`
- [X] T017 [US2] Implement coordinate normalization, reverse-geocode fallback logic, and `GET /api/records/location/resolve` in `lib/records/location-resolver.ts` and `app/api/records/location/resolve/route.ts`
- [X] T018 [P] [US2] Build scroll-snap date selector, time selector, note-length feedback, and edit-mode field hydration in `app/_components/record-editor-dialog.tsx`
- [X] T019 [P] [US2] Build the top-layer map picker, marker placement, and confirm/cancel flow in `app/_components/record-map-picker-dialog.tsx`
- [X] T020 [US2] Connect record-card tap editing, device geolocation fill, map selection fill, discard confirmation, and patch-save refresh flow in `app/_components/records-screen.tsx`, `app/_components/records-notebook-panel.tsx`, and `app/_components/record-editor-dialog.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when records can be fully
edited with mobile-friendly pickers and location-assist flows.

---

## Phase 5: User Story 3 - 未登录时引导进入个人空间 (Priority: P3)

**Goal**: Keep notebook interactions in-page for guests, distinguish account
nonexistence from wrong passwords, and show reminder dialogs without page
navigation.

**Independent Test**: While logged out, try `新增记录` or another protected
notebook action, confirm the login dialog opens in place, submit a nonexistent
assistant account and see `请先注册助手账号！`, then close without success and see
`请登录个人空间！`; after login, refresh and confirm only that account’s notebook
content loads.

- [X] T021 [P] [US3] Refine login request statuses and Simplified Chinese messages for `account_not_found` and `invalid_password` in `lib/auth/login.ts`
- [X] T022 [US3] Update `POST /api/auth/login` and shell-level auth result handling for notebook-triggered login flows in `app/api/auth/login/route.ts`, `app/_components/mobile-shell.tsx`, and `app/_components/login-register-dialog.tsx`
- [X] T023 [P] [US3] Build the notebook auth-required reminder dialog and close-only reminder behavior in `app/_components/records-auth-required-dialog.tsx`
- [X] T024 [US3] Wire guest-only notebook blocking, in-place login opening, account-not-found messaging, and follow-up `请登录个人空间！` reminder flows in `app/_components/records-screen.tsx` and `app/_components/mobile-shell.tsx`
- [X] T025 [US3] Clear or reload notebook state on auth-session changes so refresh and logout never leak records across accounts in `app/_components/records-screen.tsx`, `app/_components/mobile-shell.tsx`, and `lib/auth/session-resolver.ts`

**Checkpoint**: All user stories are complete when guests are intercepted in
place and authenticated users only ever see their own notebook after refresh.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize Chinese copy, cleanup, and validation notes across the
whole notebook feature.

- [X] T026 [P] Normalize final Simplified Chinese loading, empty, validation, and failure copy in `app/api/auth/login/route.ts`, `app/api/records/notebook/route.ts`, `app/api/records/notebook/[recordId]/route.ts`, `app/api/records/location/resolve/route.ts`, `app/_components/records-screen.tsx`, `app/_components/records-notebook-panel.tsx`, `app/_components/record-editor-dialog.tsx`, and `app/_components/records-auth-required-dialog.tsx`
- [X] T027 [P] Run lint-oriented cleanup for touched notebook files in `app/_components/*.tsx`, `app/api/records/**/*.ts`, `lib/auth/*.ts`, `lib/records/*.ts`, and `components/ui/textarea.tsx`
- [X] T028 Update the final manual validation notes and implementation checkpoints in `specs/007-records-notebook/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and extends the editor/list surfaces introduced for US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and builds on the notebook action surfaces from US1 plus the editor/login shell used by US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Can start once repository, presenters, auth guard helpers, and the notebook panel shell exist
- **US2**: Builds on the editor shell and record-list interactions introduced for US1
- **US3**: Builds on the protected notebook actions from US1 and reuses the existing auth dialog shell plus notebook editor context

### Within Each User Story

- Shared record types and repository logic before Route Handler behavior
- Route Handler behavior before frontend data integration
- Notebook panel rendering before create/delete interaction wiring
- Editor shell before date/time picker and location-assist enhancements
- Login status refinement before guest interception and reminder flows
- Story completion before cross-cutting cleanup

### Parallel Opportunities

- T001 and T002 can run in parallel during Setup
- T003, T004, T005, T006, T008, and T009 can run in parallel during Foundational
- T012 and T013 can run in parallel during US1
- T015, T018, and T019 can run in parallel during US2
- T021 and T023 can run in parallel during US3
- T026 and T027 can run in parallel during Polish

---

## Parallel Example: User Story 1

```bash
Task: "Build logged-in notebook fetching, create-mode open/close state, and delete-confirm state in app/_components/records-screen.tsx"
Task: "Render record cards, empty-state messaging, delete confirmation dialog, and 新增记录 trigger wiring in app/_components/records-notebook-panel.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Extend notebook validation and repository update helpers for edit mode, coordinates, and 100-character notes in lib/records/notebook.ts and lib/records/notebook-repository.ts"
Task: "Build the top-layer map picker, marker placement, and confirm/cancel flow in app/_components/record-map-picker-dialog.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Refine login request statuses and Simplified Chinese messages for account_not_found and invalid_password in lib/auth/login.ts"
Task: "Build the notebook auth-required reminder dialog and close-only reminder behavior in app/_components/records-auth-required-dialog.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm logged-in users can load, add, and delete notebook records before adding richer editing and guest interception behavior

### Incremental Delivery

1. Establish the notebook repository, auth guard, panel shell, and editor shell
2. Deliver logged-in notebook viewing plus create/delete (US1)
3. Add full editing, date/time selectors, and location/map assistance (US2)
4. Add guest interception, account-not-found messaging, and reminder dialogs (US3)
5. Finish copy normalization, cleanup, and manual validation updates (Phase 6)

### Suggested MVP Scope

- T001-T014 deliver the smallest complete increment that adds a usable
  logged-in notebook with summary, list, create flow, and delete flow.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend notebook access remains behind `app/api/records/**/route.ts`
- Frontend work should continue to prefer Tailwind CSS + shadcn/ui composition
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
