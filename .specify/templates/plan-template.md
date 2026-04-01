# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary user value, required Route Handlers,
frontend surfaces, and any Apache ECharts usage]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the feature. The defaults below reflect this repository's constitution.
-->

**Language/Version**: TypeScript 5.x on Next.js 16.2.x / React 19  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, shadcn/ui,
Apache ECharts, [additional dependencies or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, external API, browser storage, or N/A]  
**Testing**: [e.g., ESLint, Playwright, Vitest, contract tests, or NEEDS CLARIFICATION]  
**Target Platform**: Modern web browsers and the Next.js server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: [domain-specific, e.g., API p95 < 200ms, chart render < 1s, or NEEDS CLARIFICATION]  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; charts MUST use Apache ECharts;
user-facing product copy MUST default to Simplified Chinese  
**Scale/Scope**: [domain-specific, e.g., 10k users, 20 routes, 5 dashboards, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] All backend capabilities exposed to the frontend are mapped to App Router
      Route Handlers in `app/api/**/route.ts`.
- [ ] Frontend pages and components identify the Route Handlers they call and
      do not bypass the API boundary.
- [ ] Reusable UI is implemented with Tailwind CSS and shadcn/ui primitives;
      any custom primitive is explicitly justified.
- [ ] User-facing copy, metadata, placeholders, and loading/empty/error states
      default to Simplified Chinese unless an approved exception is recorded.
- [ ] Any data visualization uses Apache ECharts and defines loading, empty,
      error, and responsive states.
- [ ] Any exception is documented in `Complexity Tracking` and approved before
      implementation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Remove unused paths and expand the chosen structure with
  real directories before delivery.
-->

```text
app/
|-- api/
|   `-- [feature]/
|       `-- route.ts
|-- [route]/
|   |-- page.tsx
|   |-- loading.tsx
|   `-- _components/
components/
|-- ui/
|-- charts/
`-- [feature]/
lib/
|-- api/
|-- charts/
`-- utils/
tests/
|-- contract/
|-- integration/
`-- unit/
```

**Structure Decision**: [Document the actual route segments, `app/api`
endpoints, shared UI locations, and any `components/charts` or `lib/charts`
directories used by this feature]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., custom primitive outside shadcn/ui] | [current need] | [why existing primitives are insufficient] |
| [e.g., temporary non-ECharts rendering] | [specific problem] | [why the constitutional path is blocked] |
