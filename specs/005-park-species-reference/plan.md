# Implementation Plan: 栖息地鸟种参考

**Branch**: `005-park-species-reference` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-park-species-reference/spec.md`

**Note**: This plan adds one analysis-page species reference module backed by
local JSON source files under `parkinfo/`. Scope covers server-side source
reading through an App Router Route Handler, preview/full list loading,
top-layer detail modal presentation, and touch-friendly vertical card
scrolling. Apache ECharts remains explicitly out of scope.

## Summary

Add a new “栖息地鸟种参考” section to the analysis page beneath the existing
functional analysis modules and above the static help card. The section reads a
park-specific JSON source file from the repository-local `parkinfo/` directory,
normalizes recent bird observation records on the server, and exposes them
through a dedicated `GET /api/analysis/habitat-species-reference` Route
Handler. The frontend initially loads a preview of up to 10 cards showing
序号、鸟种名称、居留类型、保护级别, supports a second full-load request when
records exceed 10, and opens a top-layer modal for each card to display
生态特征 and 观测难度 on separate lines. Scrolling stays mobile-first with
native inertia plus CSS snap behavior. Chart usage is `N/A`.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, existing
shadcn/ui primitives, and repository-local JSON assets in `parkinfo/`  
**Storage**: Read-only local JSON source files under
`F:\VibeCoding\watch_the_bird\parkinfo` (repo-local `parkinfo/` directory at
runtime); no database or browser storage required for source data  
**Testing**: ESLint, `npx tsc --noEmit`, `npm run build`, and focused manual
validation of preview/full loading, park switching, modal layering, empty/error
states, and mobile scroll behavior  
**Target Platform**: Modern mobile web browsers in portrait mode and Next.js
Node.js server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: Preview data visible within 3 seconds in normal local
development conditions; modal opens within 1 second after card tap; no
horizontal overflow at target mobile widths; preview/full endpoint logic stays
fast enough for the current JSON source scale without pagination  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui as much as possible; if chart work
appears later it MUST use Apache ECharts, but this feature is currently `N/A`;
user-facing product copy MUST default to Simplified Chinese; JSON source files
must be read only on the server through the Route Handler; preview
mode MUST cap initial display at 10 records; the detail modal MUST render above
all page chrome  
**Scale/Scope**: 4 preset JSON sources currently present in `parkinfo/`,
roughly 20 to 58 usable records per park, 1 new
analysis endpoint, 1 new analysis UI surface, 1 preview mode, 1 full-load mode,
and 1 modal detail view per record

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] All backend capabilities exposed to the frontend are mapped to a new App
      Router Route Handler at `app/api/analysis/habitat-species-reference/route.ts`.
- [x] Frontend analysis surfaces call only the approved Route Handler and do
      not read local JSON files or server-only helpers directly.
- [x] Planned UI uses Tailwind CSS + shadcn/ui composition, with shadcn
      `Dialog` planned for the modal and existing `Card`/`Button`/`Separator`
      primitives reused for the list surface.
- [x] User-facing copy for titles, buttons, labels, loading states, empty
      states, and error states remains Simplified Chinese.
- [x] Apache ECharts is explicitly `N/A` for this feature slice.
- [x] No constitutional exception is required.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`
      consistently keep JSON source access behind the Route Handler boundary.
- [x] Design artifacts keep the feature on the existing `/` analysis screen
      rather than introducing a new route or top-level tab.
- [x] The planned UI remains Tailwind CSS + shadcn/ui based, and all visible
      product copy stays in Simplified Chinese.
- [x] Contract artifacts state chart scope as `N/A`, preserving the
      constitution’s visualization rule.

## Project Structure

### Documentation (this feature)

```text
specs/005-park-species-reference/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- habitat-species-reference-api-contract.md
|   `-- habitat-species-reference-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- api/
|   `-- analysis/
|       `-- habitat-species-reference/
|           `-- route.ts
`-- _components/
    |-- analysis-screen.tsx
    `-- analysis-habitat-species-reference.tsx
components/
`-- ui/
    |-- button.tsx
    |-- card.tsx
    |-- dialog.tsx
    `-- separator.tsx
lib/
|-- maps/
|   `-- park-options.ts
`-- species/
    |-- habitat-species-reference.ts
    `-- park-species-sources.ts
parkinfo/
|-- Bijiashan Park.json
|-- Fairylake Botanical Garden.json
|-- Shenzhen Bay Park.json
`-- Shenzhen Donghu Park.json
```

**Structure Decision**: Keep species-reference data access behind a dedicated
analysis Route Handler instead of piggybacking on the weather endpoint, because
JSON source parsing and preview/full query semantics are a separate backend
concern. Normalize source metadata and record-shaping helpers under
`lib/species/`, keep file-name-to-park mapping explicit, and compose the new
analysis surface in `app/_components/analysis-habitat-species-reference.tsx`.
The analysis screen will append this new component beneath the existing
analysis content stack and above the static “如何使用本页面” helper card.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
