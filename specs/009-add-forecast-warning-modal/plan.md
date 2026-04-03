# Implementation Plan: 天气与观鸟指数预报预警弹窗

**Branch**: `009-add-forecast-warning-modal` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-add-forecast-warning-modal/spec.md`

**Note**: This plan adds a modal-based forecast and warning capability under the
existing `天气与观鸟指数` panel. The backend aggregates four Shenzhen Open Data
weather/warning interfaces using one shared server-side `appKey` from `.env`.
The frontend keeps all interactions inside the analysis screen and uses
Tailwind CSS + shadcn/ui only. Apache ECharts is explicitly out of scope.

## Summary

Add a deep-green CTA button below `请求时间 / 刷新结果` in the analysis weather
panel. Clicking the button opens a top-layer vertically scrollable modal that
shows four independent sections for the currently selected park district:
`分区逐时预报`、`分区预报`、`日月时刻`、`灾害预警`.  
One new App Router Route Handler will aggregate and normalize four Shenzhen Open
Data APIs:

- `https://opendata.sz.gov.cn/api/339779363/1/service.xhtml` (分区逐时预报)
- `https://opendata.sz.gov.cn/api/29200_00903517/1/service.xhtml` (分区预报)
- `https://opendata.sz.gov.cn/api/1214604037/1/service.xhtml` (日月时刻)
- `https://opendata.sz.gov.cn/api/589826359/1/service.xhtml` (灾害预警)

All upstream calls use `appKey = process.env.SZ_WEATHER_APP_KEY`, `page`, and
`rows`, with optional `startDate/endDate` when time-window filtering can reduce
payload size. To reduce large-dataset consumption, requests stay on-demand with
bounded row counts and per-module filtering on the server.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, existing
shadcn/ui primitives (`Card`, `Button`, `Dialog`, `Separator`), existing fetch
runtime (no new package required)  
**Storage**: External Shenzhen Open Data APIs only; no new persistent storage  
**Testing**: ESLint, `npx tsc --noEmit`, `npm run build`, and focused manual
validation for modal layering, four-module states, district switching, warning
detail dialog, and mobile portrait layout  
**Target Platform**: Modern mobile web browsers (portrait) and Next.js Node.js
server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: Modal open interaction feedback immediately (< 100ms
local); first aggregated response in normal network conditions within 5 seconds;
server requests should avoid over-fetching by limiting upstream `rows` and
using date windows where applicable  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; user-facing copy MUST default to
Simplified Chinese; charts are `N/A`; upstream parameters MUST include
`appKey/page/rows` and may include `startDate/endDate`; each upstream `rows`
value MUST stay <= 10000; dataset size is large so server must fetch only data
needed for current modal context  
**Scale/Scope**: 1 new analysis Route Handler, 1 existing analysis panel update,
1 forecast-warning modal surface, 1 warning-detail dialog, 4 independently
rendered data modules, and 4 upstream API integrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] All backend capabilities exposed to the frontend are mapped to App Router
      Route Handlers in `app/api/**/route.ts`.
- [x] Frontend pages and components identify the Route Handlers they call and
      do not bypass the API boundary.
- [x] Reusable UI is implemented with Tailwind CSS and shadcn/ui primitives;
      no second component system is introduced.
- [x] User-facing copy, metadata, placeholders, and loading/empty/error states
      default to Simplified Chinese unless an approved exception is recorded.
- [x] Any data visualization uses Apache ECharts and defines loading, empty,
      error, and responsive states. This feature is `N/A`.
- [x] Missing dependencies that block a more efficient implementation path are
      identified early and surfaced before fallback decisions. No new
      dependency is required for this feature.
- [x] No exception is required before planning.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, and `contracts/` keep all frontend-facing
      weather/warning access behind one analysis Route Handler.
- [x] The modal and warning-detail interaction stays in analysis components and
      does not introduce new top-level route navigation.
- [x] All added user-visible copy remains Simplified Chinese, including loading,
      empty, and error text.
- [x] Contract artifacts explicitly mark chart scope as `N/A`.
- [x] The design enforces on-demand upstream fetching with bounded `rows` and
      optional date-window parameters to reduce consumption.

## Project Structure

### Documentation (this feature)

```text
specs/009-add-forecast-warning-modal/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- analysis-forecast-warning-api-contract.md
|   `-- analysis-forecast-warning-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- api/
|   `-- analysis/
|       `-- forecast-warning/
|           `-- route.ts
`-- _components/
    |-- analysis-birding-outlook.tsx
    `-- analysis-forecast-warning-modal.tsx
components/
`-- ui/
    |-- button.tsx
    |-- card.tsx
    |-- dialog.tsx
    `-- separator.tsx
lib/
|-- maps/
|   `-- park-options.ts
`-- weather/
    |-- amap-weather.ts
    `-- sz-forecast-warning.ts
```

**Structure Decision**: Keep all new backend behavior in one Route Handler
(`GET /api/analysis/forecast-warning?parkId=...`) and centralize Shenzhen Open
Data upstream composition/normalization in `lib/weather/sz-forecast-warning.ts`.
Keep the button entry inside existing `analysis-birding-outlook.tsx`, extract
modal rendering to a focused `analysis-forecast-warning-modal.tsx`, and use
existing shadcn dialog primitives for top-layer modal and warning-detail popup.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
