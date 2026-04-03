# Tasks: 天气与观鸟指数预报预警弹窗

**Input**: Design documents from `/specs/009-add-forecast-warning-modal/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks are generated for this feature because the
spec and quickstart emphasize `npm run lint`, `npx tsc --noEmit`,
`npm run build`, and focused manual validation of modal layering, four-module
independence, district switching, warning detail popup, and portrait layout.

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
- **Feature docs**: `specs/009-add-forecast-warning-modal/**`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare environment variables, validation scripts, and feature file
scaffolding for forecast-warning integration.

- [X] T001 Add `SZ_WEATHER_APP_KEY` placeholder and server-only notes in `.env.example`
- [X] T002 [P] Extend environment validation to require `SZ_WEATHER_APP_KEY` in `scripts/verify-amap-env.mjs`
- [X] T003 [P] Create feature scaffolds in `app/api/analysis/forecast-warning/route.ts`, `lib/weather/sz-forecast-warning.ts`, and `app/_components/analysis-forecast-warning-modal.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared upstream access, normalization, and route orchestration
foundations required before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Define aggregated response types, module state envelopes, and field normalizers in `lib/weather/sz-forecast-warning.ts`
- [X] T005 [P] Implement four upstream request builders with shared `appKey/page/rows` and optional `startDate/endDate` support in `lib/weather/sz-forecast-warning.ts`
- [X] T006 [P] Implement district matching and Beijing-time filtering helpers (`DDATETIME`, `ISSUETIME`) in `lib/weather/sz-forecast-warning.ts`
- [X] T007 Implement `GET /api/analysis/forecast-warning` query validation and park-context resolution in `app/api/analysis/forecast-warning/route.ts`
- [X] T008 Implement route-level aggregation orchestration and top-level status mapping (`success`/`partial`/`invalid_park`/`failed`) in `app/api/analysis/forecast-warning/route.ts`

**Checkpoint**: Foundation ready; the modal can request one aggregated payload
for the selected park district with stable status semantics.

---

## Phase 3: User Story 1 - 从天气面板打开预报预警弹窗 (Priority: P1) MVP

**Goal**: Add the CTA entry under weather panel actions and open a top-layer,
vertically scrollable modal that loads district-scoped forecast-warning data.

**Independent Test**: 打开“分析”页面，在“天气与观鸟指数”组件底部确认存在“点击获取预报预警”按钮；点击后出现顶层弹窗且可纵向滚动，弹窗内容默认绑定当前地图所选公园所属区县。

- [X] T009 [P] [US1] Build modal shell, header context, and four independent module containers in `app/_components/analysis-forecast-warning-modal.tsx`
- [X] T010 [US1] Add deep-green CTA button and modal open or close wiring below `请求时间/刷新结果` in `app/_components/analysis-birding-outlook.tsx`
- [X] T011 [US1] Implement modal-side fetch flow for `/api/analysis/forecast-warning?parkId=...` with latest-request-wins handling in `app/_components/analysis-forecast-warning-modal.tsx`
- [X] T012 [US1] Render module-level loading, empty, and error states independently in `app/_components/analysis-forecast-warning-modal.tsx`

**Checkpoint**: User Story 1 is complete when users can open the modal from the
weather panel and see district-bound, independently staged module containers.

---

## Phase 4: User Story 2 - 浏览分区逐时预报与分区预报卡片 (Priority: P2)

**Goal**: Deliver horizontally scrollable forecast cards for hourly and district
forecast sections with strict field ordering and time-window filtering.

**Independent Test**: 打开弹窗后检查两个模块均存在独立外层圆角容器；逐时预报仅展示当前北京时间之后的已更新时次，分区预报仅展示今天及之后时次；当时次数量过多时模块使用横向滚动卡片。

- [X] T013 [P] [US2] Implement hourly forecast normalization (`WEATHERSTATUS`, `QPFTEMP`, `DDATETIME`) and post-now filtering in `lib/weather/sz-forecast-warning.ts`
- [X] T014 [P] [US2] Implement district forecast normalization (`WEATHERSTATUS`, `MINTEMPERATURE`, `MAXTEMPERATURE`, `DDATETIME`) and today-plus filtering in `lib/weather/sz-forecast-warning.ts`
- [X] T015 [US2] Extend hourly and district module payload assembly in `app/api/analysis/forecast-warning/route.ts`
- [X] T016 [US2] Implement two horizontal card-list UIs with required three-line centered layout in `app/_components/analysis-forecast-warning-modal.tsx`

**Checkpoint**: User Stories 1 and 2 are complete when both forecast modules
render correct card content, filtering windows, and horizontal overflow handling.

---

## Phase 5: User Story 3 - 查看日月时刻与灾害预警明细 (Priority: P3)

**Goal**: Deliver sun-moon timing rows and disaster-warning list with effective
status filtering, level-color rules, and detail popup behavior.

**Independent Test**: 打开弹窗后检查“日月时刻”模块按行展示 `ATTRIBNAME/ATTRIBVALUE` 且有分隔线；“灾害预警”模块仅显示当前北京时间仍处于“发布”且未取消的记录，点击预警行能查看 `ISSUECONTENT` 与 `DISTRICT` 明细。

- [X] T017 [P] [US3] Implement sun-moon normalization (`ATTRIBNAME`, `ATTRIBVALUE`, `DDATETIME`) with today-only filtering in `lib/weather/sz-forecast-warning.ts`
- [X] T018 [P] [US3] Implement disaster warning effective-state resolution (`发布` vs `取消`), text formatting, and color fallback rules in `lib/weather/sz-forecast-warning.ts`
- [X] T019 [US3] Extend sun-moon and warning module payload assembly with detail fields in `app/api/analysis/forecast-warning/route.ts`
- [X] T020 [P] [US3] Implement sun-moon separator rows and warning list line rendering (`序号 SIGNALTYPE SIGNALLEVEL预警`) in `app/_components/analysis-forecast-warning-modal.tsx`
- [X] T021 [US3] Add warning detail dialog click flow showing `ISSUECONTENT` and `DISTRICT`, including non-clickable gray placeholder behavior in `app/_components/analysis-forecast-warning-modal.tsx`

**Checkpoint**: All user stories are complete when sun-moon and warning modules
follow the required filtering, formatting, color, and detail-interaction rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, consumption tuning, and validation cleanup across
API and UI.

- [ ] T022 Normalize final Simplified Chinese copy and fallback messages in `app/api/analysis/forecast-warning/route.ts`, `app/_components/analysis-birding-outlook.tsx`, and `app/_components/analysis-forecast-warning-modal.tsx`
- [ ] T023 Tune on-demand data-consumption strategy (`rows` caps and optional `startDate/endDate`) in `lib/weather/sz-forecast-warning.ts` and `app/api/analysis/forecast-warning/route.ts`
- [ ] T024 Resolve lint, type, and build issues in `app/api/analysis/forecast-warning/route.ts`, `app/_components/analysis-birding-outlook.tsx`, `app/_components/analysis-forecast-warning-modal.tsx`, `lib/weather/sz-forecast-warning.ts`, and `scripts/verify-amap-env.mjs`
- [ ] T025 [P] Refresh manual validation and environment notes in `specs/009-add-forecast-warning-modal/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and extends modal forecast modules
- **User Story 3 (Phase 5)**: Depends on Foundational completion and extends modal detail modules
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Can start once aggregated route base and modal scaffolding exist
- **US2**: Builds on US1 modal request/section shells, but remains independently testable within the same modal surface
- **US3**: Builds on US1 modal shell and extends with sun-moon/warning-specific interactions

### Within Each User Story

- Server-side normalization before route payload assembly
- Route payload assembly before frontend module rendering
- Module rendering before edge-case and interaction hardening
- Story completion before cross-cutting polish

### Parallel Opportunities

- T002 and T003 can run in parallel during Setup
- T004, T005, and T006 can run in parallel during Foundational
- T009 and T011 can run in parallel during US1
- T013 and T014 can run in parallel during US2
- T017, T018, and T020 can run in parallel during US3
- T025 can run in parallel with final cleanup once implementation stabilizes

---

## Parallel Example: User Story 1

```bash
Task: "Build modal shell, header context, and four independent module containers in app/_components/analysis-forecast-warning-modal.tsx"
Task: "Implement modal-side fetch flow for /api/analysis/forecast-warning?parkId=... with latest-request-wins handling in app/_components/analysis-forecast-warning-modal.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Implement hourly forecast normalization (WEATHERSTATUS, QPFTEMP, DDATETIME) and post-now filtering in lib/weather/sz-forecast-warning.ts"
Task: "Implement district forecast normalization (WEATHERSTATUS, MINTEMPERATURE, MAXTEMPERATURE, DDATETIME) and today-plus filtering in lib/weather/sz-forecast-warning.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Implement sun-moon normalization (ATTRIBNAME, ATTRIBVALUE, DDATETIME) with today-only filtering in lib/weather/sz-forecast-warning.ts"
Task: "Implement disaster warning effective-state resolution (发布 vs 取消), text formatting, and color fallback rules in lib/weather/sz-forecast-warning.ts"
Task: "Implement sun-moon separator rows and warning list line rendering in app/_components/analysis-forecast-warning-modal.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm modal entry, top-layer behavior, and district-bound data loading before deeper module formatting work

### Incremental Delivery

1. Build env and aggregation foundations (Phases 1-2)
2. Deliver modal entry and independent module containers (US1)
3. Deliver two forecast card modules with time filtering (US2)
4. Deliver sun-moon and warning detail interactions (US3)
5. Finalize copy, consumption tuning, and validation docs (Phase 6)

### Suggested MVP Scope

- T001-T012 deliver the smallest complete increment that adds a usable
  forecast-warning modal entry and district-scoped data flow.

---

## Notes

- All tasks follow the strict checkbox + ID + label + file path format
- Backend access remains strictly behind `app/api/analysis/**/route.ts`
- Frontend composition continues with Tailwind CSS + shadcn/ui
- Apache ECharts tasks are intentionally omitted because chart scope is `N/A`
- On-demand upstream fetch constraints (`rows` cap and date windows) are treated
  as first-class implementation requirements
