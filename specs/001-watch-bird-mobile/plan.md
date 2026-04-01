# Implementation Plan: Watch The Bird Mobile Web Experience

**Branch**: `001-watch-bird-mobile` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-watch-bird-mobile/spec.md`

**Note**: This plan covers the v1 mobile shell only: a fixed top bar, three
switchable portrait-first screens, and lightweight animated transitions.

## Summary

Deliver a light-themed mobile-first web shell for Watch The Bird at `/` with a
fixed three-button top bar, default birdwatching index analysis view, no-refresh
screen switching, portrait-only guidance, and smooth fade/slide transitions.
The feature does not expose backend capabilities in v1, so no Route Handlers or
chart implementations are required for this slice. Frontend UI should use
Tailwind CSS and shadcn/ui components wherever feasible, with custom code
limited to shell-specific interaction and orientation behavior.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui
primitives wherever feasible, existing `next/font` setup  
**Storage**: N/A  
**Testing**: ESLint plus manual mobile viewport acceptance checks for
navigation, orientation, scrolling, and transition behavior  
**Target Platform**: Modern mobile browsers in portrait mode, especially iOS
Safari and Android Chrome within 375px to 430px viewport widths  
**Project Type**: Next.js App Router web application  
**Performance Goals**: Initial shell renders without layout shift in the target
mobile range; visible tab-switch feedback completes within roughly 300ms; no
horizontal overflow during normal use  
**Constraints**: Frontend components should use Tailwind CSS + shadcn/ui as the
default implementation path; no dedicated landscape layout; no backend/API
surface in v1; no ECharts usage in this feature slice because analysis charts
are out of scope  
**Scale/Scope**: One public route (`/`), one fixed mobile shell, three
top-level screens, no persistence, no authentication, no remote integrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] No backend capabilities are exposed in this v1 shell, so no App Router
      Route Handlers are required and no frontend-to-backend boundary is being
      bypassed.
- [x] All user-facing work is confined to frontend route and component design;
      no server-only business logic is imported into the interactive shell.
- [x] Reusable UI will use Tailwind CSS and shadcn/ui components wherever
      feasible; custom implementation is limited to shell orchestration,
      orientation handling, and simple transitions.
- [x] This feature introduces no charts, so the Apache ECharts requirement is
      explicitly `N/A` rather than omitted.
- [x] No constitutional exceptions or complexity waivers are required.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` keep
      the feature frontend-only and do not introduce hidden API requirements.
- [x] The design keeps the interactive boundary local to the mobile shell
      rather than converting the entire route tree to client-rendered code.
- [x] The contract and quickstart artifacts preserve the Tailwind CSS +
      shadcn/ui implementation preference as the default path.

## Project Structure

### Documentation (this feature)

```text
specs/001-watch-bird-mobile/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- mobile-shell-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- globals.css
|-- layout.tsx
|-- page.tsx
`-- _components/
    |-- mobile-shell.tsx
    |-- top-nav.tsx
    |-- screen-frame.tsx
    |-- analysis-screen.tsx
    |-- identify-screen.tsx
    `-- records-screen.tsx
components/
`-- ui/
    |-- button.tsx
    |-- card.tsx
    `-- separator.tsx
lib/
`-- utils.ts
```

**Structure Decision**: Keep the public experience on `app/page.tsx` and render
an interactive client-side shell from a local `app/_components/` subtree so the
route entry can stay simple and the client boundary remains small. Reusable
primitives should live under `components/ui/` using shadcn/ui conventions.
No `app/api/**/route.ts` files are needed for this feature because the spec
explicitly scopes out backend data exchange.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
