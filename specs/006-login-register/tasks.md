# Tasks: 登录/注册入口与弹窗

**Input**: Design documents from `/specs/006-login-register/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
design artifacts and quickstart emphasize `npm run lint`, `npx tsc --noEmit`,
`npm run build`, and focused manual validation of auth entry placement, dialog
layering, login success/failure, session persistence across tab switching, and
refresh reset behavior.

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
- **Public assets**: `public/**`
- **Feature docs**: `specs/006-login-register/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the shared UI primitive and local asset required by the auth entry experience.

- [X] T001 [P] Create the shadcn-style text input primitive for auth forms in `components/ui/input.tsx`
- [X] T002 [P] Add the default administrator avatar asset in `public/images/default-admin-avatar.png`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared auth state, reusable component boundaries, and server-side login helpers required before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Define the built-in test account constants, credential trimming helpers, and login response types in `lib/auth/login.ts`
- [X] T004 Create shell-level auth session state, dialog mode state, and the right-top auth entry slot below the fixed nav in `app/_components/mobile-shell.tsx`
- [X] T005 [P] Create the shared auth entry prop contract and guest-state action layout in `app/_components/auth-entry.tsx`
- [X] T006 [P] Create the shared login/register dialog shell, mode switching, and mobile-safe modal layout in `app/_components/login-register-dialog.tsx`

**Checkpoint**: Foundation ready; the auth session boundary, entry slot, and shared dialog shell all exist.

---

## Phase 3: User Story 1 - 使用测试账号登录 (Priority: P1) MVP

**Goal**: Let users open the login dialog from the top-right entry and sign in with the built-in test account without leaving the current page.

**Independent Test**: Open any screen, tap `登录`, confirm the dialog shows `助手账号` and `用户密码`, verify empty or wrong credentials produce Chinese feedback, then submit `WTBTEST / 123456` and confirm the dialog closes successfully.

- [X] T007 [US1] Implement `POST /api/auth/login` request validation and HTTP responses in `app/api/auth/login/route.ts`
- [X] T008 [P] [US1] Build the login form fields, submit action, pending state, and Chinese validation/error regions in `app/_components/login-register-dialog.tsx`
- [X] T009 [US1] Wire the guest `登录` action from `app/_components/auth-entry.tsx` through `app/_components/mobile-shell.tsx` to call `app/api/auth/login/route.ts`
- [X] T010 [US1] Handle login success, dialog close, and `invalid_input` versus `invalid_credentials` feedback in `app/_components/mobile-shell.tsx` and `app/_components/login-register-dialog.tsx`

**Checkpoint**: User Story 1 is complete when the shared auth entry supports a full login attempt with visible success and failure outcomes.

---

## Phase 4: User Story 2 - 查看注册引导提示 (Priority: P2)

**Goal**: Let users open a registration guidance dialog that shows the administrator avatar and contact notice without exposing a real registration form.

**Independent Test**: Tap `注册`, confirm a modal opens above the page chrome, shows the default administrator avatar and `请联系管理员注册与登录`, and does not show any submit-capable registration form or backend request.

- [X] T011 [P] [US2] Render the registration guidance content, local avatar, and Simplified Chinese notice in `app/_components/login-register-dialog.tsx` and `public/images/default-admin-avatar.png`
- [X] T012 [US2] Wire the `注册` action and enforce one-auth-dialog-at-a-time behavior in `app/_components/auth-entry.tsx` and `app/_components/mobile-shell.tsx`
- [X] T013 [US2] Remove any submit-capable registration controls and keep only dismiss behavior in `app/_components/login-register-dialog.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when users can open either auth entry and always see the correct modal content.

---

## Phase 5: User Story 3 - 在当前会话中识别登录状态 (Priority: P3)

**Goal**: Keep the logged-in state visible in the current page session and consistent while switching between the analysis, identify, and records screens.

**Independent Test**: Log in with `WTBTEST / 123456`, confirm the top-right area switches to an authenticated state with the assistant account label, switch between `分析`、`识别`、`记录` and confirm the state remains consistent, then refresh and confirm the page returns to the guest state.

- [X] T014 [P] [US3] Render the authenticated status text and assistant account label in `app/_components/auth-entry.tsx`
- [X] T015 [P] [US3] Preserve the auth session snapshot while switching `分析`、`识别`、`记录` screens in `app/_components/mobile-shell.tsx`
- [X] T016 [US3] Reset to the guest auth entry on refresh without leaking stale assistant account data in `app/_components/mobile-shell.tsx`

**Checkpoint**: All user stories are complete when the current page session clearly reflects whether the user is logged in and stays stable across screen switching.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize modal behavior, Chinese copy, and validation notes across the feature.

- [X] T017 [P] Adjust top-layer modal layering, overflow, and close interactions in `components/ui/dialog.tsx`, `app/_components/login-register-dialog.tsx`, and `app/_components/mobile-shell.tsx`
- [X] T018 [P] Normalize all auth-related visible copy and error messages to Simplified Chinese in `app/api/auth/login/route.ts`, `app/_components/auth-entry.tsx`, and `app/_components/login-register-dialog.tsx`
- [X] T019 Update the manual validation notes for the final auth flow in `specs/006-login-register/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses the shared dialog shell from Phase 2
- **User Story 3 (Phase 5)**: Depends on Foundational completion and builds on the successful login flow from US1
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Can start once the shell-level auth state, auth entry slot, and shared dialog shell exist
- **US2**: Can start once the shared dialog shell and auth entry actions exist; it does not require the login API to be complete
- **US3**: Depends on US1 because the authenticated state is only meaningful after a successful login flow exists

### Within Each User Story

- Shared server-side credential helpers before the Route Handler
- Shared dialog shell before story-specific login or registration content
- Route Handler behavior before frontend login submission wiring
- Guest auth entry behavior before authenticated-state rendering
- Session persistence across screen switching before refresh-reset hardening

### Parallel Opportunities

- T001 and T002 can run in parallel during Setup
- T003, T005, and T006 can run in parallel during Foundational
- T007 and T008 can run in parallel during US1
- T011 and T012 can run in parallel during US2
- T014 and T015 can run in parallel during US3
- T017 and T018 can run in parallel during Polish

---

## Parallel Example: User Story 1

```bash
Task: "Implement POST /api/auth/login request validation and HTTP responses in app/api/auth/login/route.ts"
Task: "Build the login form fields, submit action, pending state, and Chinese validation/error regions in app/_components/login-register-dialog.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Render the registration guidance content, local avatar, and Simplified Chinese notice in app/_components/login-register-dialog.tsx and public/images/default-admin-avatar.png"
Task: "Wire the 注册 action and enforce one-auth-dialog-at-a-time behavior in app/_components/auth-entry.tsx and app/_components/mobile-shell.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Render the authenticated status text and assistant account label in app/_components/auth-entry.tsx"
Task: "Preserve the auth session snapshot while switching 分析、识别、记录 screens in app/_components/mobile-shell.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the login dialog, test-account validation, and success/failure feedback all work before adding registration guidance or authenticated-state polish

### Incremental Delivery

1. Establish the shared auth primitive, local avatar asset, and shell-level auth state
2. Deliver the login flow for the built-in test account (US1)
3. Add the registration guidance dialog with static administrator contact content (US2)
4. Add the authenticated-state presentation and session-scoped continuity across screens (US3)
5. Finish modal hardening, copy normalization, and manual validation updates (Phase 6)

### Suggested MVP Scope

- T001-T010 deliver the smallest complete increment that adds a working login entry, login modal, and login API validation flow.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend work remains behind `app/api/auth/login/route.ts`
- Frontend work should continue to prefer Tailwind CSS + shadcn/ui composition
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
