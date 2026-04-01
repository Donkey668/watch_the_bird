# Implementation Plan: 分析总览核心信息

**Branch**: `004-analysis-overview` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-analysis-overview/spec.md`

**Note**: This plan replaces the analysis page placeholder overview with a
rule-driven summary rendered below the existing weather and birding index
panel. Scope is limited to reusing the current analysis API contract, deriving
Beijing-time-based summary fields, and rendering the result with Tailwind CSS +
shadcn/ui. Apache ECharts remains explicitly out of scope.

## Summary

Replace the current placeholder “观鸟指数分析 / 今日概览” section on the
analysis screen with a real “分析总览” block positioned below the existing
weather and birding outlook panel. Reuse `GET /api/analysis/birding-outlook`
as the single frontend data source, extend its response with a server-derived
analysis overview snapshot, and render that snapshot in a dedicated mobile-safe
overview card. The new summary includes one Beijing-time display string in the
format `2026年4月1日 09:30`, a habitat activity value derived from the current
birding index plus time window rules, a migration signal derived from month
mapping, and a fixed observation confidence value of `稳定`. Chart usage is
`N/A`.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui
primitives, existing `app/api/analysis/birding-outlook/route.ts`, existing
`lib/weather/birding-outlook.ts`, and built-in `Intl.DateTimeFormat` with
`Asia/Shanghai` timezone handling  
**Storage**: N/A; this feature derives transient summary data from the existing
weather and birding response only  
**Testing**: ESLint, `npx tsc --noEmit`, and focused manual validation of time
formatting, six time-window rules, month mapping, partial-unavailable behavior,
and mobile layout  
**Target Platform**: Modern mobile web browsers in portrait mode and Next.js
server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: Analysis overview appears as part of the same
birding-outlook response without adding a second client fetch; the complete
weather + overview experience remains visible within 3 seconds in normal
network conditions; no horizontal overflow at target widths  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; charts MUST use Apache ECharts
when present, but this feature is `N/A`; user-facing product copy MUST default
to Simplified Chinese; the overview MUST display Beijing time as
`YYYY年M月D日 HH:mm`; the overview MUST NOT explicitly display a current time
slot label; habitat activity MUST render `暂不可用` when the birding index is
unavailable  
**Scale/Scope**: One existing route (`/`), one reused analysis endpoint, one
new overview UI surface, six time windows, four migration-signal month bands,
and one fixed observation-confidence label

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] All backend capabilities exposed to the frontend stay behind the
      existing App Router Route Handler at `app/api/analysis/birding-outlook/route.ts`.
- [x] Frontend analysis surfaces continue to call only the approved route
      handler and do not bypass the API boundary for time or summary logic.
- [x] The new overview UI is composed with Tailwind CSS + shadcn/ui primitives
      and does not introduce another component system.
- [x] User-facing copy for the overview, fallback states, and labels remains
      Simplified Chinese.
- [x] Apache ECharts is explicitly `N/A` for this feature slice.
- [x] No constitutional exception is required.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`
      consistently keep the overview derived from the existing Route Handler.
- [x] Design artifacts keep the feature scoped to the analysis page under the
      existing weather and birding panel instead of introducing another route
      or tab.
- [x] The planned UI continues to use Tailwind CSS + shadcn/ui and keeps all
      visible text in Simplified Chinese.
- [x] Contract artifacts state chart scope as `N/A`, preserving the
      constitution’s visualization rule.

## Project Structure

### Documentation (this feature)

```text
specs/004-analysis-overview/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- analysis-overview-api-contract.md
|   `-- analysis-overview-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- api/
|   `-- analysis/
|       `-- birding-outlook/
|           `-- route.ts
`-- _components/
    |-- analysis-screen.tsx
    |-- analysis-birding-outlook.tsx
    `-- analysis-overview-panel.tsx
components/
`-- ui/
    |-- button.tsx
    |-- card.tsx
    `-- separator.tsx
lib/
|-- analysis/
|   `-- analysis-overview.ts
|-- time/
|   `-- beijing-time.ts
`-- weather/
    `-- birding-outlook.ts
```

**Structure Decision**: Keep one frontend request path by extending the
existing analysis route response rather than adding another endpoint. Derive
Beijing-time display text and overview rules on the server in pure helpers
under `lib/analysis/` and `lib/time/`, extend the normalized response types in
`lib/weather/birding-outlook.ts`, and render the new summary via a dedicated
`analysis-overview-panel.tsx` placed below the weather/birding card. Existing
placeholder markup in `analysis-screen.tsx` will be removed once the dedicated
overview panel is wired in.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
