# Implementation Plan: Analysis Park Map Selector

**Branch**: `002-analysis-park-map` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-analysis-park-map/spec.md`

**Note**: This plan adds an AMap-powered park selector map to the analysis
screen only. Scope includes layout, park switching, marker updates, and mobile
viewport behavior in the existing shell.

## Summary

Add a horizontal map panel directly under the fixed top navigation bar on the
analysis screen, with a top-right dropdown that lists four preset parks:
Shenzhen Bay Park, Shenzhen East Lake Park, Bijia Mountain Park, and Fairy Lake
Botanical Garden. Selecting a park re-centers the map and updates a single
marker without page refresh. The implementation remains frontend-only in this
slice, uses Tailwind CSS + shadcn/ui for interface composition, and uses AMap
JSAPI v2.0 for map rendering.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui
primitives, `@amap/amap-jsapi-loader`, AMap JSAPI v2.0  
**Storage**: In-memory UI state only (selected park, map ready/error states)  
**Testing**: ESLint + manual viewport and interaction validation for layout,
park switching, map fallback, and no-refresh behavior  
**Target Platform**: Modern mobile browsers in portrait mode (375px-430px) plus
general browser compatibility for responsive web usage  
**Project Type**: Next.js App Router frontend web application  
**Performance Goals**: Analysis view renders without horizontal overflow; park
switch updates visible map center and marker within 1 second in normal network
conditions; no layout shift from map block insertion  
**Constraints**: Frontend components must default to Tailwind CSS + shadcn/ui;
map must render below fixed top bar; no full-page refresh on park switch; this
slice adds no backend data contract; AMap key/security code must be injected via
environment configuration and not hardcoded in source  
**Scale/Scope**: One route (`/`), one map surface in analysis screen, four fixed
park presets, one active marker at a time, no user-defined search/persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] No new backend capabilities are exposed to frontend, so no new App Router
      Route Handlers are required for this feature scope.
- [x] Frontend work remains within route/UI components and does not bypass an
      API boundary for protected server logic.
- [x] UI composition defaults to Tailwind CSS + shadcn/ui; custom map wrapper
      logic is feature-specific and not a replacement UI framework.
- [x] No chart surface is introduced; Apache ECharts requirement is explicitly
      `N/A` for this map-focused feature.
- [x] No constitutional exception or waiver is required.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` keep
      the feature frontend-only and do not introduce hidden backend contracts.
- [x] Design artifacts keep map integration scoped to analysis-view components
      and maintain the current shell routing pattern.
- [x] Contracts and quickstart preserve Tailwind CSS + shadcn/ui defaults while
      documenting AMap lifecycle and security configuration expectations.

## Project Structure

### Documentation (this feature)

```text
specs/002-analysis-park-map/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- analysis-map-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- globals.css
`-- _components/
    |-- analysis-screen.tsx
    |-- analysis-map-panel.tsx
    `-- mobile-shell.tsx
components/
`-- ui/
    `-- select.tsx
lib/
`-- maps/
    |-- amap-loader.ts
    `-- park-options.ts
```

**Structure Decision**: Keep the map as an analysis-screen composition concern by
adding a dedicated client map panel component and map-specific helpers under
`lib/maps/`. Reuse existing shell architecture and avoid new routes or backend
handlers for this slice. Park configuration is fixed and local to frontend data.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
