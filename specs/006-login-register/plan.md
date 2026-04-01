# Implementation Plan: 登录/注册入口与弹窗

**Branch**: `006-login-register` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-login-register/spec.md`

**Note**: This plan adds a lightweight authentication entry experience to the
existing mobile shell. Scope covers a login validation Route Handler, a shared
right-top auth entry surface, login and registration dialogs, and per-session
auth state feedback. Apache ECharts remains explicitly out of scope.

## Summary

Add a shared “登录/注册” entry beneath the fixed top navigation and align it to
the top-right corner of the mobile shell. The feature introduces one backend
Route Handler at `POST /api/auth/login` to validate a single built-in test
account (`WTBTEST / 123456`). The frontend presents a login dialog for account
verification, a registration guidance dialog with a default administrator avatar
and the message “请联系管理员注册与登录”, and a visible logged-in state after
successful authentication. The logged-in state is session-scoped to the current
page lifecycle and may reset on refresh. Chart usage is `N/A`.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, existing
shadcn/ui primitives (`Button`, `Card`, `Dialog`, `Separator`), and existing
utility packages already in the repository; no new external package dependency
is currently required  
**Storage**: Server-side in-memory test credential definition plus client-side
session-only auth state in the current browser tab; no database, cookies, or
persistent browser storage required for this feature slice  
**Testing**: ESLint, `npx tsc --noEmit`, `npm run build`, and focused manual
validation of entry placement, dialog behavior, login success/failure, page
switch persistence, and refresh reset behavior  
**Target Platform**: Modern mobile web browsers in portrait mode and the
Next.js Node.js server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: Auth entry visible within 2 seconds of first render;
dialog open within 1 second of user tap; login response visible within 1 second
in local development conditions; no horizontal overflow at 375px to 430px  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; charts MUST use Apache ECharts if
introduced later but this feature is `N/A`; user-facing product copy MUST
default to Simplified Chinese; current phase MUST NOT introduce a public
registration backend; when a better implementation path depends on a missing
dependency, that gap MUST be surfaced before fallback  
**Scale/Scope**: 1 login endpoint, 1 built-in test account, 2 dialogs, 1 shared
auth entry region, 3 consumer screens (`分析` / `识别` / `记录`), and 1
session-scoped logged-in state

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] All backend capabilities exposed to the frontend are mapped to an App
      Router Route Handler in `app/api/auth/login/route.ts`.
- [x] Frontend auth entry and dialogs call only the approved Route Handler and
      do not bypass the API boundary.
- [x] Reusable UI remains Tailwind CSS + shadcn/ui based; the feature is
      expected to add a local `Input` primitive only because the repository does
      not currently include one.
- [x] User-facing copy, placeholders, validation feedback, and dialog content
      remain Simplified Chinese.
- [x] Any data visualization uses Apache ECharts and defines loading, empty,
      error, and responsive states. This feature is `N/A`.
- [x] Missing dependencies that block a better implementation path are
      identified early and surfaced before fallback decisions. No such external
      dependency gap is currently required.
- [x] No exception is required before planning.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`
      consistently keep login validation behind the Route Handler boundary.
- [x] The design keeps the feature inside the existing mobile shell instead of
      introducing a new page or top-level route.
- [x] All visible copy in the designed auth entry, dialogs, and feedback states
      stays in Simplified Chinese.
- [x] Contract artifacts explicitly mark chart scope as `N/A`.

## Project Structure

### Documentation (this feature)

```text
specs/006-login-register/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- auth-login-api-contract.md
|   `-- auth-entry-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- api/
|   `-- auth/
|       `-- login/
|           `-- route.ts
`-- _components/
    |-- auth-entry.tsx
    |-- login-register-dialog.tsx
    |-- mobile-shell.tsx
    |-- top-nav.tsx
    |-- analysis-screen.tsx
    |-- identify-screen.tsx
    `-- records-screen.tsx
components/
`-- ui/
    |-- button.tsx
    |-- card.tsx
    |-- dialog.tsx
    |-- input.tsx
    `-- separator.tsx
lib/
|-- auth/
|   `-- login.ts
`-- utils.ts
public/
`-- images/
    `-- default-admin-avatar.png
```

**Structure Decision**: Keep the login endpoint isolated under
`app/api/auth/login/route.ts`, centralize credential validation helpers in
`lib/auth/login.ts`, and place the shared entry surface inside the mobile shell
so it remains visible across `分析`、`识别`、`记录` screens. Add a local
`components/ui/input.tsx` primitive to stay aligned with the shadcn/ui pattern.
The default administrator avatar will be a repo-local asset under `public/`
instead of a remote image dependency.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
