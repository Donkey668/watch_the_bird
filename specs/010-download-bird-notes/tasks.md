# Tasks: 分析页记事本导出

**Input**: Design documents from `/specs/010-download-bird-notes/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1: Setup

- [x] T001 创建导出能力逻辑文件 `lib/records/notebook-export.ts`，定义导出上下文、导出行项与导出文档类型。
- [x] T002 [P] 在 `app/_components/records-notebook-panel.tsx` 引入导出逻辑所需引用，不改变现有渲染行为。
- [x] T003 [P] 对照 `contracts/analysis-notebook-export-api-contract.md` 与 `contracts/analysis-notebook-export-ui-contract.md`，确认复用 `GET /api/records/notebook`，不新增接口。

## Phase 2: Foundational

- [x] T004 在 `lib/records/notebook-export.ts` 实现文件名规则：`xx的观鸟记录.txt`，并处理非法文件名字符。
- [x] T005 [P] 在 `lib/records/notebook-export.ts` 实现单行格式：`序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`
- [x] T006 [P] 在 `lib/records/notebook-export.ts` 实现多行拼接（每行一条，记录间换行）。
- [x] T007 在 `lib/records/notebook-export.ts` 实现浏览器下载触发逻辑（`Blob + object URL + download`）。

## Phase 3: User Story 1 (P1)

- [x] T008 [US1] 在 `app/_components/records-notebook-panel.tsx` 新增“保存记录到本地”点击处理并调用导出函数。
- [x] T009 [US1] 在 `app/_components/records-notebook-panel.tsx` 使用 `authSession.assistantAccount` 作为导出文件名来源。
- [x] T010 [US1] 在 `app/_components/records-notebook-panel.tsx` 使用 `notebook.records` 全量数据触发导出。
- [x] T011 [US1] 在 `app/_components/records-notebook-panel.tsx` 增加防御逻辑（账号为空/记录为空不触发下载）。

## Phase 4: User Story 2 (P2)

- [x] T012 [US2] 在 `app/_components/records-notebook-panel.tsx` 实现入口显隐：未登录隐藏。
- [x] T013 [US2] 在 `app/_components/records-notebook-panel.tsx` 实现入口显隐：已登录但无条目隐藏。
- [x] T014 [US2] 在 `app/_components/records-notebook-panel.tsx` 实现入口显隐：已登录且有条目显示。
- [x] T015 [US2] 如需状态透传，仅在 `app/_components/records-screen.tsx` 与 `app/_components/records-notebook-panel.tsx` 间增加最小必要 props（本次实现无需新增透传）。

## Phase 5: User Story 3 (P3)

- [x] T016 [US3] 在 `app/_components/records-notebook-panel.tsx` 将入口放置在“新增记录”按钮下方。
- [x] T017 [US3] 在 `app/_components/records-notebook-panel.tsx` 使用与说明文案一致字号：`text-sm leading-6`。
- [x] T018 [US3] 在 `app/_components/records-notebook-panel.tsx` 保持入口为文本形态并保证键盘可访问（Enter/Space）。
- [x] T019 [US3] 在 `lib/records/notebook-export.ts` 校准输出细节（中文标点、`HH-MM`、句末 `。`）。

## Phase 6: Polish

- [x] T020 [P] 更新文档并对齐最终行为：
  - `specs/010-download-bird-notes/quickstart.md`
  - `specs/010-download-bird-notes/contracts/analysis-notebook-export-api-contract.md`
  - `specs/010-download-bird-notes/contracts/analysis-notebook-export-ui-contract.md`
- [x] T021 运行并通过静态检查：
  - `npm run lint`
  - `npx tsc --noEmit`
- [x] T022 按 quickstart 回填验证结论到 `specs/010-download-bird-notes/quickstart.md`。