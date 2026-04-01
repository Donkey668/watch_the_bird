# Implementation Plan: 记录页记事本

**Branch**: `007-records-notebook` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-records-notebook/spec.md`

**Note**: This plan adds an account-bound notebook to the existing `记录` page.
Scope covers notebook CRUD Route Handlers, location resolution for bird points,
auth-interception refinements, top-layer record editing dialogs, and mobile-only
list interactions. Apache ECharts remains explicitly out of scope.

## Summary

Add a notebook module below the existing `个人空间 / 个人观测记录` heading on the
`记录` screen. Backend work includes `GET` and `POST` handlers at
`/api/records/notebook`, `PATCH` and `DELETE` handlers at
`/api/records/notebook/[recordId]`, and a location-resolution handler at
`/api/records/location/resolve`. The feature also refines the existing
`POST /api/auth/login` result model so notebook-triggered login prompts can
distinguish nonexistent accounts from wrong passwords. The frontend scope covers
the notebook stats row, record list, centered `新增记录` action, record editor
dialog, delete/discard confirmations, map picker, and in-place login/reminder
overlays. Chart usage is `N/A`.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, existing
shadcn/ui-style primitives (`Button`, `Card`, `Dialog`, `Input`, `Select`,
`Separator`), existing `@amap/amap-jsapi-loader`, and Node.js `fs/promises`;
no new npm dependency is currently required  
**Storage**: Server-side file-backed JSON notebook repository under
`data/notebooks/`, keyed by assistant account, plus the existing cookie +
server-memory auth session model via `wtb_auth_session`  
**Testing**: ESLint, `npx tsc --noEmit`, `npm run build`, and focused manual
validation of auth interception, notebook CRUD, date/time selectors, device
location fill, map point selection, and refresh persistence  
**Target Platform**: Modern mobile web browsers in portrait mode (`375px` to
`430px`) and the Next.js Node.js server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: Authenticated notebook summary and list visible within
2 seconds of entering `记录`; create/update/delete reflected in-panel within 2
seconds in local development; map picker open within 1 second after map assets
are ready; no horizontal overflow in any notebook state  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; charts MUST use Apache ECharts if
introduced later but this feature is `N/A`; user-facing product copy MUST
default to Simplified Chinese; notebook interactions MUST stay in-page with
top-layer dialogs; when a better implementation path depends on a missing
dependency, that gap MUST be surfaced before fallback  
**Scale/Scope**: 1 records-screen notebook surface, 6 HTTP contracts across 4
route files (`auth/login` refinement, notebook collection, notebook item, and
location resolve), 1 per-account file repository, 1 mobile editor flow, 1 map
picker flow, and a small-record local usage profile suitable for dozens to low
hundreds of records per account

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] All backend capabilities exposed to the frontend are mapped to App Router
      Route Handlers in `app/api/**/route.ts`.
- [x] Frontend pages and components identify the Route Handlers they call and
      do not bypass the API boundary.
- [x] Reusable UI is implemented with Tailwind CSS and shadcn/ui primitives;
      any custom primitive is explicitly justified.
- [x] User-facing copy, metadata, placeholders, and loading/empty/error states
      default to Simplified Chinese unless an approved exception is recorded.
- [x] Any data visualization uses Apache ECharts and defines loading, empty,
      error, and responsive states. This feature is `N/A`.
- [x] Missing dependencies that block a more efficient implementation path are
      identified early and surfaced before fallback decisions are made. No such
      dependency gap is currently required.
- [x] No exception is required before planning.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`
      consistently keep notebook CRUD and location resolution behind Route
      Handlers.
- [x] The design keeps notebook editing, deletion, map selection, and auth
      reminders inside the current records screen context.
- [x] All visible copy in the designed notebook panel, dialogs, reminders, and
      error states remains Simplified Chinese.
- [x] Contract artifacts explicitly mark chart scope as `N/A`.

## Project Structure

### Documentation (this feature)

```text
specs/007-records-notebook/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- records-location-api-contract.md
|   |-- records-notebook-api-contract.md
|   `-- records-notebook-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- api/
|   |-- auth/
|   |   `-- login/
|   |       `-- route.ts
|   `-- records/
|       |-- location/
|       |   `-- resolve/
|       |       `-- route.ts
|       `-- notebook/
|           |-- route.ts
|           `-- [recordId]/
|               `-- route.ts
`-- _components/
    |-- mobile-shell.tsx
    |-- records-screen.tsx
    |-- records-notebook-panel.tsx
    |-- record-editor-dialog.tsx
    |-- record-map-picker-dialog.tsx
    `-- records-auth-required-dialog.tsx
components/
`-- ui/
    |-- button.tsx
    |-- dialog.tsx
    |-- input.tsx
    |-- separator.tsx
    |-- select.tsx
    `-- textarea.tsx
data/
`-- notebooks/
lib/
|-- auth/
|   |-- login.ts
|   |-- session-store.ts
|   `-- session-resolver.ts
|-- maps/
|   `-- amap-loader.ts
`-- records/
    |-- notebook.ts
    |-- notebook-presenter.ts
    |-- notebook-repository.ts
    `-- location-resolver.ts
```

**Structure Decision**: Keep notebook CRUD and coordinate resolution in
dedicated App Router Route Handlers under `app/api/records/**`. Reuse the
existing auth route and session store, but introduce a small server-side auth
resolver in `lib/auth/` so notebook handlers can consistently resolve the
current assistant account from cookies. Keep the page-specific notebook UI in
`app/_components/` and local shadcn-style primitives in `components/ui/`.
Persist notebook documents in `data/notebooks/` so records remain tied to the
account on the server side and survive page refreshes without adding a database.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
