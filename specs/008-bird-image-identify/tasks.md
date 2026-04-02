# Tasks: 识别页鸟影识别

**Input**: Design documents from `/specs/008-bird-image-identify/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
design artifacts emphasize `npm run lint`, `npx tsc --noEmit`, `npm run build`,
and focused manual validation of upload preview, latest-upload-wins behavior,
no-bird messaging, partial encyclopedia fallback, and portrait mobile layout.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Route Handlers**: `app/api/**/route.ts`
- **Feature-local UI**: `app/_components/`
- **Shared logic**: `lib/**`
- **Scripts**: `scripts/**`
- **Feature docs**: `specs/008-bird-image-identify/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the dependency, environment, and feature file scaffolding
required by the implementation plan.

- [X] T001 Add the `openai` dependency and an identify env verification script entry in `package.json`
- [X] T002 [P] Add the `DASHSCOPE_API_KEY` placeholder and usage notes for this feature in `.env.example`
- [X] T003 [P] Create identify feature file shells in `scripts/verify-identify-env.mjs`, `app/api/identify/bird-recognition/route.ts`, `app/_components/identify-upload-card.tsx`, `app/_components/identify-result-card.tsx`, `app/_components/identify-encyclopedia-card.tsx`, `lib/ai/dashscope-client.ts`, `lib/identify/identify-contract.ts`, `lib/identify/image-upload.ts`, `lib/identify/bird-recognition.ts`, and `lib/identify/bird-encyclopedia.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared AI client, response contract, and image handling
infrastructure required before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Implement server-side DashScope client initialization and env assertions in `lib/ai/dashscope-client.ts`
- [X] T005 [P] Define normalized identify response types, status guards, and encyclopedia section helpers in `lib/identify/identify-contract.ts`
- [X] T006 [P] Implement single-image validation, supported MIME checks, and `image_url` payload preparation in `lib/identify/image-upload.ts`

**Checkpoint**: Foundation ready; the identify feature can call the model
through one Route Handler and return normalized data to the page.

---

## Phase 3: User Story 1 - 上传图片并查看鸟类识别结果 (Priority: P1) MVP

**Goal**: Let users upload one local image, see an immediate 4:3 preview, and
receive normalized bird names on the `识别` screen without leaving the page.

**Independent Test**: 打开“识别”页面，确认标题前导文案改为“鸟影识别”；点击上传框选择一张本地图片后，确认图片立即预览，页面显示“识别中......”，随后在结果区展示中文名、英文名和拉丁学名。

- [X] T007 [P] [US1] Implement bird-recognition prompt construction, JSON parsing, and success-result normalization in `lib/identify/bird-recognition.ts`
- [X] T008 [US1] Implement the `POST /api/identify/bird-recognition` multipart success flow in `app/api/identify/bird-recognition/route.ts`
- [X] T009 [P] [US1] Build the 4:3 upload frame, hidden file input, empty state, and preview rendering in `app/_components/identify-upload-card.tsx`
- [X] T010 [P] [US1] Build the recognition result card for 简体中文名、英文学名、拉丁学名 in `app/_components/identify-result-card.tsx`
- [X] T011 [US1] Replace the placeholder identify content and connect upload, loading, preview, and success rendering in `app/_components/identify-screen.tsx`

**Checkpoint**: User Story 1 is complete when the identify page supports one
image upload, immediate preview, loading feedback, and normalized bird-name
results.

---

## Phase 4: User Story 2 - 查看与识别结果对应的鸟类百科简介 (Priority: P2)

**Goal**: Extend a successful recognition result with a structured encyclopedia
summary that is directly renderable on the same screen.

**Independent Test**: 上传一张能识别出明确鸟种的图片，确认识别结果下方出现整行百科简介，且内容至少覆盖物种特征、生活习性、分布区域和保护级别，保护级别中的括号内容不显示。

- [X] T012 [P] [US2] Implement encyclopedia prompt construction, section normalization, and protection-text cleanup in `lib/identify/bird-encyclopedia.ts`
- [X] T013 [US2] Extend `app/api/identify/bird-recognition/route.ts` to orchestrate encyclopedia generation and return `partial` responses
- [X] T014 [P] [US2] Build the encyclopedia summary card and unavailable fallback state in `app/_components/identify-encyclopedia-card.tsx`
- [X] T015 [US2] Wire encyclopedia sections and partial-success rendering into `app/_components/identify-screen.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when successful recognitions
also render a cleaned encyclopedia summary, and partial encyclopedia failures
stay isolated to the encyclopedia area.

---

## Phase 5: User Story 3 - 在识别失败或更换图片时保持页面清晰可用 (Priority: P3)

**Goal**: Keep the identify page recoverable when uploads are invalid, birds
cannot be recognized, or users rapidly replace the current image.

**Independent Test**: 依次测试无效图片、无法识别图片、上传新图片覆盖旧结果等场景，确认页面始终保留上传入口、给出明确简体中文提示，并且不会将旧图片结果错误映射到新图片上。

- [ ] T016 [P] [US3] Add invalid-image, unrecognized, and upstream-failure response branches in `app/api/identify/bird-recognition/route.ts`
- [ ] T017 [P] [US3] Add invalid-file interception, retry-safe upload resets, and persistent bottom-note rendering in `app/_components/identify-upload-card.tsx` and `app/_components/identify-result-card.tsx`
- [ ] T018 [US3] Enforce latest-upload-wins request sequencing, stale-result clearing, and portrait-safe error or unrecognized states in `app/_components/identify-screen.tsx`

**Checkpoint**: All user stories are complete when the identify page handles
invalid files, no-bird outcomes, retry flows, and rapid re-uploads without
stale content or horizontal overflow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize copy, cleanup, and validation notes across the whole
identify experience.

- [ ] T019 Normalize final Simplified Chinese copy and failure messaging in `app/api/identify/bird-recognition/route.ts`, `app/_components/identify-screen.tsx`, `app/_components/identify-upload-card.tsx`, `app/_components/identify-result-card.tsx`, and `app/_components/identify-encyclopedia-card.tsx`
- [ ] T020 Resolve lint, type, and build issues in `app/api/identify/bird-recognition/route.ts`, `app/_components/identify-screen.tsx`, `app/_components/identify-upload-card.tsx`, `app/_components/identify-result-card.tsx`, `app/_components/identify-encyclopedia-card.tsx`, `lib/ai/dashscope-client.ts`, `lib/identify/identify-contract.ts`, `lib/identify/image-upload.ts`, `lib/identify/bird-recognition.ts`, and `lib/identify/bird-encyclopedia.ts`
- [ ] T021 [P] Validate local setup and refresh the manual verification steps in `scripts/verify-identify-env.mjs` and `specs/008-bird-image-identify/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and extends the recognition flow delivered in US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and hardens the upload/result flow introduced in US1
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Can start once the DashScope client, normalized response contract, and image validation helpers exist
- **US2**: Builds on the successful recognition flow and response shapes introduced for US1
- **US3**: Builds on the upload, preview, and result flow from US1 and should re-verify the partial encyclopedia state delivered by US2 when both are shipped together

### Within Each User Story

- Server-side normalization before Route Handler orchestration
- Route Handler behavior before client integration
- Upload and result card composition before full-screen state wiring
- Encyclopedia normalization before partial-success rendering
- Error-state normalization before latest-upload-wins and retry handling
- Story completion before cross-cutting cleanup

### Parallel Opportunities

- T002 and T003 can run in parallel during Setup
- T004, T005, and T006 can run in parallel during Foundational
- T007, T009, and T010 can run in parallel during US1
- T012 and T014 can run in parallel during US2
- T016 and T017 can run in parallel during US3
- T021 can run in parallel with final code cleanup once implementation is stable

---

## Parallel Example: User Story 1

```bash
Task: "Implement bird-recognition prompt construction, JSON parsing, and success-result normalization in lib/identify/bird-recognition.ts"
Task: "Build the 4:3 upload frame, hidden file input, empty state, and preview rendering in app/_components/identify-upload-card.tsx"
Task: "Build the recognition result card for 简体中文名、英文学名、拉丁学名 in app/_components/identify-result-card.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Implement encyclopedia prompt construction, section normalization, and protection-text cleanup in lib/identify/bird-encyclopedia.ts"
Task: "Build the encyclopedia summary card and unavailable fallback state in app/_components/identify-encyclopedia-card.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add invalid-image, unrecognized, and upstream-failure response branches in app/api/identify/bird-recognition/route.ts"
Task: "Add invalid-file interception, retry-safe upload resets, and persistent bottom-note rendering in app/_components/identify-upload-card.tsx and app/_components/identify-result-card.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the identify page supports upload, preview, loading, and normalized bird-name results before adding encyclopedia and recovery behavior

### Incremental Delivery

1. Establish the dependency, env verification, AI client, contracts, and image validation helpers
2. Deliver upload, preview, and recognition results on the identify screen (US1)
3. Add encyclopedia generation and partial-success rendering (US2)
4. Add invalid-image, no-bird, retry, and latest-upload-wins handling (US3)
5. Finish copy normalization, cleanup, and manual validation updates (Phase 6)

### Suggested MVP Scope

- T001-T011 deliver the smallest complete increment that adds a usable bird
  image recognition flow to the existing `识别` page.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend identify functionality remains behind `app/api/identify/**/route.ts`
- Frontend work should continue to prefer Tailwind CSS + shadcn/ui composition
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
- The missing `openai` dependency is surfaced explicitly instead of being
  replaced by a weaker fallback path
