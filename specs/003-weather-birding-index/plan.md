# Implementation Plan: Analysis Weather and Birding Index

**Branch**: `003-weather-birding-index` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-weather-birding-index/spec.md`

## Summary

Keep the existing analysis-page weather and birding-index panel below the map,
but replace the previous LLM evaluation flow with a fixed local algorithm. The
Route Handler still resolves the selected preset park, queries AMap district
weather, normalizes the JSON payload, and returns one supported birding-index
enum. The difference is that the server now computes the index locally from
weather phenomenon, wind power, temperature, and humidity using fixed weighted
scoring rules.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui
primitives, existing `@amap/amap-jsapi-loader`, AMap REST weather service  
**Storage**: None; runtime reads from AMap weather only  
**Testing**: ESLint, TypeScript, production build, and manual API/UI validation  
**Target Platform**: Modern portrait mobile browsers plus Next.js server runtime  
**Project Type**: Next.js App Router full-stack web application  
**Performance Goals**: Default result and park-switch refresh within 3 seconds in
normal conditions; no horizontal overflow in portrait mobile view  
**Constraints**: Backend interfaces stay in `app/api/**/route.ts`; frontend
composition remains Tailwind CSS + shadcn/ui; no ECharts scope; no LLM calls;
weather lookup must use a composed GET URL with `key`; birding index must follow
fixed local weighted scoring  
**Scale/Scope**: One analysis-page panel, one aggregation endpoint, four preset
parks, one local scoring engine

## Constitution Check

**Status**: PASS

- Backend exposure remains a Route Handler under `app/api/**/route.ts`.
- The frontend still calls only the approved backend endpoint.
- UI composition remains Tailwind CSS + shadcn/ui based.
- No chart scope is introduced.
- No constitutional waiver is needed.

## Project Structure

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
lib/
|-- ai/
|   `-- birding-index.ts
|-- weather/
|   |-- amap-weather.ts
|   `-- birding-outlook.ts
|-- maps/
|   `-- park-options.ts
scripts/
`-- verify-amap-env.mjs
```

## Design Decisions

- Keep the public API surface unchanged: `GET /api/analysis/birding-outlook?parkId=...`.
- Reuse the existing `lib/ai/birding-index.ts` path, but implement a local scoring engine inside it to minimize integration churn.
- Keep weather failure and birding-index failure as separate states so the UI can still render valid weather details when scoring is unavailable.
- Preserve the existing client request flow and latest-selection-wins behavior.

## Scoring Algorithm Summary

- `总分 = 天气 × 0.4 + 风力 × 0.2 + 温度 × 0.2 + 湿度 × 0.2`
- Final score is rounded to the nearest integer.
- `80-100 => 适宜`
- `60-79 => 较适宜`
- `0-59 => 不适宜`
- Unsupported weather text or unparsable wind/temperature/humidity yields `status = unavailable`.

## Implementation Notes

- `lib/weather/amap-weather.ts` remains responsible for upstream request composition and weather normalization.
- `lib/ai/birding-index.ts` now contains the local scoring tables and parsing helpers.
- `app/api/analysis/birding-outlook/route.ts` still decides among `success`, `partial`, `invalid_park`, and `failed`.
- `scripts/verify-amap-env.mjs` and `.env.example` no longer require DashScope-related variables.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
