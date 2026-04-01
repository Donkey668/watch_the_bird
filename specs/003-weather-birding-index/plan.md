# Implementation Plan: Analysis Weather and Birding Index

**Branch**: `003-weather-birding-index` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-weather-birding-index/spec.md`

**Note**: This plan adds a weather-driven birding outlook block below the
existing analysis map. Scope includes one backend aggregation endpoint, one
analysis-page surface, AMap weather querying, AI-based birding index judgment,
and mobile-safe loading/error states.

## Summary

Add a weather and birding outlook panel directly below the existing park map on
the analysis screen. The frontend will request one App Router Route Handler
with the currently selected `parkId`. That Route Handler will map the park to
its district, compose a GET request to the AMap weather endpoint, parse the
JSON response, send the normalized weather snapshot to a DashScope-compatible
OpenAI SDK client, and return one supported birding index enum value along with
all returned weather fields needed for rendering. The UI
remains Tailwind CSS + shadcn/ui based, and Apache ECharts remains explicitly
out of scope.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui
primitives, `openai`, existing `@amap/amap-jsapi-loader`, AMap REST weather
service (`GET https://restapi.amap.com/v3/weather/weatherInfo`)  
**Storage**: N/A for persistence; runtime reads from AMap Weather API and
DashScope-compatible LLM service only  
**Testing**: ESLint plus manual API/UI validation for default load, park
switching, partial failure, and final-selection-wins behavior  
**Target Platform**: Modern mobile browsers in portrait mode plus Next.js
server runtime for backend aggregation  
**Project Type**: Next.js App Router full-stack web application  
**Performance Goals**: Default birding outlook visible within 3 seconds in
normal network conditions; park switch refresh completes within 3 seconds; no
horizontal overflow in the analysis panel  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; chart usage is `N/A`; weather
query MUST be composed as a URL GET request with required `key` parameter;
weather payload MUST be parsed from JSON response; LLM call MUST use the
OpenAI SDK against `https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1`;
LLM output MUST use `response_format: { type: "json_object" }`, and the prompt
contract MUST force birding-index-ready JSON data only  
**Scale/Scope**: One route (`/`), one aggregation endpoint, four preset parks,
one weather/birding panel, one birding index enum with three allowed values

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] Weather and AI capabilities exposed to the frontend are mapped to a
      dedicated App Router Route Handler under `app/api/**/route.ts`.
- [x] The analysis page will call only the approved Route Handler and will not
      access AMap Weather API or DashScope directly from the client.
- [x] UI composition remains Tailwind CSS + shadcn/ui based for cards, status
      blocks, field rows, separators, and retry affordances.
- [x] No data visualization is introduced; Apache ECharts requirement is
      explicitly `N/A`.
- [x] No constitutional exception or waiver is required.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`
      consistently keep server-side integrations behind the Route Handler.
- [x] Design artifacts keep the new panel scoped to the analysis screen below
      the existing map component instead of introducing new routes.
- [x] Contracts and quickstart preserve Tailwind CSS + shadcn/ui defaults and
      keep chart scope explicitly out of feature boundaries.

## Project Structure

### Documentation (this feature)

```text
specs/003-weather-birding-index/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- analysis-birding-outlook-api-contract.md
|   `-- analysis-birding-outlook-ui-contract.md
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
    |-- analysis-map-panel.tsx
    `-- analysis-birding-outlook.tsx
components/
`-- ui/
    |-- card.tsx
    |-- separator.tsx
    |-- button.tsx
    `-- [existing shadcn primitives reused as needed]
lib/
|-- ai/
|   `-- birding-index.ts
|-- maps/
|   `-- park-options.ts
`-- weather/
    |-- amap-weather.ts
    `-- birding-outlook.ts
scripts/
`-- verify-amap-env.mjs
```

**Structure Decision**: Keep the user-facing experience inside the existing
analysis screen by adding one new client panel component below
`analysis-map-panel.tsx`. Introduce one server-side aggregation Route Handler at
`app/api/analysis/birding-outlook/route.ts`, plus server-only weather and AI
helpers under `lib/weather/` and `lib/ai/`. Extend local park metadata with
district mapping needed for district-level weather lookup.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
