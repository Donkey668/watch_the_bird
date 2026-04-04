# Implementation Plan: 分析页记事本导出

**Branch**: `010-download-bird-notes` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/010-download-bird-notes/spec.md`

## Summary

在“分析”页面记事本区域新增“保存记录到本地”文本入口，满足“仅登录且有条目时可见”的显示规则；用户点击后将当前账号全部记事本条目导出为 `.txt` 文件，命名为“xx的观鸟记录.txt”，并按固定中文行格式输出。  
本功能不新增图表，Apache ECharts 范围为 `N/A`。

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.x / React 19  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui（Button/Card/Separator 等现有组件）  
**Storage**: 复用现有服务端记事本存储（`data/notebooks/*.json`）与现有记事本读取接口返回的数据快照  
**Testing**: `npm run lint`、`npx tsc --noEmit`、手工验证下载文件名与内容格式  
**Target Platform**: 现代桌面/移动浏览器（支持 Blob 下载）与 Next.js Node.js runtime  
**Project Type**: Next.js 全栈 Web 应用  
**Performance Goals**: 点击后 1 秒内触发浏览器下载（常规网络与 500 条以内记录场景）  
**Constraints**: 后端边界维持 `app/api/**/route.ts`；前端使用 Tailwind + shadcn/ui；用户可见文案默认为简体中文；无图表需求需明确 `N/A`；不新增不必要依赖  
**Scale/Scope**: 1 个页面入口位置调整、1 条导出交互链路、0 个新 Route Handler、1 份 txt 文件生成规则

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All backend capabilities exposed to the frontend are mapped to App Router
      Route Handlers in `app/api/**/route.ts`.
- [x] Frontend pages and components identify the Route Handlers they call and
      do not bypass the API boundary.
- [x] Reusable UI is implemented with Tailwind CSS and shadcn/ui primitives;
      any custom primitive is explicitly justified.
- [x] User-facing copy, metadata, placeholders, and loading/empty/error states
      default to Simplified Chinese unless an approved exception is recorded.
- [x] Any data visualization uses Apache ECharts and defines loading, empty,
      error, and responsive states.
- [x] Missing dependencies that block a more efficient implementation path are
      identified early and surfaced to the user before fallback decisions are made.
- [x] Any exception is documented in `Complexity Tracking` and approved before
      implementation.

**Post-Design Re-check**: 通过。Phase 1 设计后仍无宪章违规项。

## Project Structure

### Documentation (this feature)

```text
specs/010-download-bird-notes/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- analysis-notebook-export-api-contract.md
|   `-- analysis-notebook-export-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- _components/
|   |-- records-screen.tsx
|   `-- records-notebook-panel.tsx
|-- api/
|   `-- records/
|       `-- notebook/
|           `-- route.ts
lib/
`-- records/
    |-- notebook.ts
    `-- notebook-export.ts
```

**Structure Decision**: 不新增 Route Handler，复用 `GET /api/records/notebook` 的返回数据。  
前端改动聚焦在 `records-notebook-panel.tsx`（新增入口与点击行为）与必要的上层状态传递。  
导出文本规则与文件名处理收敛到 `lib/records/notebook-export.ts`，避免 UI 层拼接逻辑分散。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
