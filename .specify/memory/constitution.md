<!--
Sync Impact Report
Version change: 1.1.0 -> 1.2.0
Modified principles:
- None
Added sections:
- VI. Dependency Readiness Transparency
Removed sections:
- None
Templates requiring updates:
- updated: .specify/templates/plan-template.md
- updated: .specify/templates/tasks-template.md
- reviewed/no change: .specify/templates/spec-template.md
- not present: .specify/templates/commands/*.md
- reviewed/no change: README.md
- reviewed/no change: AGENTS.md
Follow-up TODOs:
- None
-->
# watch_the_bird Constitution

## Core Principles

### I. App Router Route Handler Boundary
All backend capabilities exposed to the frontend MUST be implemented as App Router
Route Handlers under `app/api/**/route.ts`. In this repository, the term
"API Route" explicitly means App Router Route Handlers, not `pages/api`.
Frontend code MUST NOT access databases, privileged third-party services, or
server-only business logic directly. Rationale: Next.js 16 centers on the App
Router model, and one backend entry pattern keeps auth, caching, error
handling, and deployment behavior consistent.

### II. Frontend Calls Backend Contracts
All UI-facing data reads and mutations MUST call approved Route Handlers through
documented HTTP contracts. Pages, Client Components, and any other frontend
interaction layer MUST NOT bypass the API boundary by importing backend flows
directly. Each endpoint MUST define its caller, request shape, success payload,
and failure semantics during specification and planning. Rationale: a stable
contract boundary keeps the frontend replaceable, testable, and auditable.

### III. Tailwind CSS + shadcn/ui + Simplified Chinese UI Standard
All frontend components MUST be built with Tailwind CSS and shadcn/ui. All
user-facing product copy, metadata, navigation labels, placeholders, loading
states, empty states, error states, and any default visible text in shared UI
primitives MUST use Simplified Chinese. Reusable primitives SHOULD live in
`components/ui/`, while feature composition may live in route-local
`_components` folders or other shared component directories. Custom primitives
are allowed only when shadcn/ui does not provide an appropriate foundation, and
any exception MUST still use Tailwind-driven styling instead of introducing a
second UI framework. Brand names or third-party proper nouns MAY remain
non-Chinese only when accuracy requires it and the surrounding UI provides
clear Chinese context. Rationale: one component system, one styling language,
and one primary copy language reduce visual and linguistic drift.

### IV. Apache ECharts Visualization Standard
All charts and data visualizations MUST use Apache ECharts. Chart work MUST
define loading, empty, error, and responsive states, and shared chart helpers
SHOULD be centralized in `components/charts/` or `lib/charts/` when reuse
appears. If a feature does not require charts, its specification MUST say
`N/A` explicitly rather than leaving the decision implicit. Rationale: a single
charting engine improves consistency, reuse, and bundle discipline.

### V. Spec-Driven Compliance Gates
Every feature MUST capture its required Route Handlers, frontend consumers, UI
composition choices, and chart surfaces in `spec.md`, `plan.md`, and
`tasks.md`. Any deviation from this constitution MUST be recorded in
`Complexity Tracking` or an explicit amendment proposal with justification,
rejected alternatives, and impact scope before implementation begins.
Rationale: constraints are only enforceable when they are visible at the
specification, planning, and review stages.

### VI. Dependency Readiness Transparency
When a materially more efficient, more maintainable, or more constitution-
aligned implementation path is blocked only because a required dependency is
not installed, the team MUST notify the user about that dependency before
defaulting to a weaker fallback. The notice MUST identify the missing package,
binary, or runtime, explain why it enables the better path, and clarify whether
installation is needed in the current environment. Silent fallback is allowed
only when the user has already rejected installation or when the fallback is
explicitly requested. Rationale: surfacing dependency gaps early lets the user
choose the better path instead of inheriting avoidable technical debt.

## Technical Standards

- Baseline stack: Next.js 16.2.1, React 19.2.4, TypeScript 5.x, and Tailwind
  CSS 4.x.
- Routing baseline: public UI routes live in `app/**/page.tsx`; backend
  endpoints live in `app/api/**/route.ts`; `pages/api` is prohibited.
- UI baseline: shared primitives belong in `components/ui/`; feature-specific
  composition may live in `app/**/_components/` or other shared component
  folders, but MUST remain Tailwind CSS + shadcn/ui based.
- Copy baseline: user-facing copy, metadata, aria labels meant for end users,
  placeholders, and shared default/fallback text MUST be Simplified Chinese
  unless an approved exception is recorded in the feature spec.
- Visualization baseline: shared chart adapters and option builders SHOULD live
  in `components/charts/` or `lib/charts/`.
- Dependency baseline: when a preferred implementation path depends on a
  missing package, binary, runtime, or local tool, that dependency gap MUST be
  surfaced to the user before adopting a slower or less capable workaround.
- Documentation baseline: every feature spec MUST state the Route Handlers it
  needs, the frontend surfaces that call them, whether chart work is required
  or `N/A`, and any approved non-Chinese copy exception.

## Delivery Workflow

- `spec.md` MUST describe user stories, functional requirements, Route
  Handlers, frontend component surfaces, chart requirements or `N/A`, and any
  approved non-Chinese copy exception.
- `plan.md` MUST pass the Constitution Check before research is finalized and
  again before task generation begins.
- `tasks.md` MUST include distinct work items for Route Handlers, frontend
  integration, UI composition, Simplified Chinese copy changes, and ECharts
  implementation whenever those concerns exist in scope.
- Planning and implementation work MUST surface missing dependencies whenever
  they block a more efficient path; fallback tasks or shortcuts MUST document
  why the preferred dependency-backed path was not taken.
- Code review MUST block any change that bypasses Route Handlers, introduces a
  non-approved component library, uses a charting library other than Apache
  ECharts, introduces non-Chinese user-facing copy without a documented
  exception, or silently replaces a better dependency-backed path with an
  undisclosed fallback.
- Approved exceptions MUST include a migration or rollback plan when they
  create future debt against this constitution.

## Governance

This constitution supersedes conflicting repository habits for architecture and
stack choices. Amendments require an update to `.specify/memory/constitution.md`
plus a sync review of dependent templates and guidance files in the same change.
Versioning follows semantic versioning: MAJOR for breaking principle changes or
removals, MINOR for new principles or materially expanded requirements, and
PATCH for clarifications or editorial refinements. Every feature plan and code
review MUST include an explicit compliance review against these principles; work
that is non-compliant remains blocked until an exception or amendment is
approved. `AGENTS.md` remains the execution guide for agent behavior, and
`node_modules/next/dist/docs/` remains the canonical Next.js implementation
reference. When those sources conflict with this constitution on project-level
architecture or approved libraries, this constitution governs.

**Version**: 1.2.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-04-01
