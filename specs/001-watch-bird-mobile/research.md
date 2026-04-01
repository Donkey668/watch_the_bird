# Research: Watch The Bird Mobile Web Experience

## Decision 1: Use a single public route with a local interactive shell

- **Decision**: Keep the feature on `app/page.tsx` and render a nested client
  shell component that manages the three top-level screens locally.
- **Rationale**: Next.js App Router pages are Server Components by default, so
  the interactive state boundary can stay limited to the shell component instead
  of converting the full route to a client bundle. This matches the product
  requirement for no-refresh switching while keeping the route structure simple.
- **Alternatives considered**:
  - Create three separate App Router pages and navigate between them.
    Rejected because the feature is described as one mobile shell with button-led
    view switching rather than three URL-driven pages.
  - Convert the entire route tree to a Client Component.
    Rejected because only the shell needs state, click handling, and orientation
    logic.

## Decision 2: Prefer Tailwind CSS + shadcn/ui for all reusable UI

- **Decision**: Use shadcn/ui primitives wherever a matching control exists,
  with Tailwind CSS utilities handling layout, spacing, responsive rules, and
  motion states. Custom components should be introduced only for patterns that
  are specific to this shell.
- **Rationale**: This satisfies the project constitution and the user’s request
  that frontend components use Tailwind CSS + shadcn/ui as much as possible,
  while still allowing shell-specific composition.
- **Alternatives considered**:
  - Build every control from raw Tailwind classes.
    Rejected because it would increase review and consistency cost for controls
    that already match shadcn/ui primitives.
  - Introduce another component library.
    Rejected because it violates the repository constitution.

## Decision 3: Keep navigation state client-side and local to the shell

- **Decision**: Model the active screen as local UI state with exactly three
  valid values: analysis, identify, and records.
- **Rationale**: The feature has no persistence, sharing, or deep-linking
  requirement in v1, so local state is the smallest solution that still meets
  the interaction spec.
- **Alternatives considered**:
  - Persist the active tab in backend storage.
    Rejected because no backend behavior is required in the spec.
  - Persist the active tab in long-lived browser storage.
    Rejected because restoring cross-session state is not required for v1.

## Decision 4: Use simple CSS/Tailwind transitions instead of an animation library

- **Decision**: Implement the screen-change animation with CSS transitions
  based on opacity and translate transforms, coordinated in the client shell.
- **Rationale**: The requirement calls for simple fade/slide feedback, which can
  be met without introducing another dependency. This keeps bundle weight and
  implementation complexity lower.
- **Alternatives considered**:
  - Add a dedicated animation library.
    Rejected because the interaction requirement is modest and does not justify
    an extra dependency.
  - Use no animation.
    Rejected because it would not meet the requested visual smoothness.

## Decision 5: Handle landscape mode with a portrait guidance state

- **Decision**: Detect orientation at the client boundary and show a lightweight
  landscape guidance state instead of designing a separate horizontal layout.
- **Rationale**: The spec explicitly forbids a landscape layout and asks for the
  product to remain portrait-oriented. A dedicated prompt is the clearest way to
  enforce that constraint.
- **Alternatives considered**:
  - Let the portrait layout shrink awkwardly in landscape.
    Rejected because it violates the “no landscape layout” requirement.
  - Build a dedicated landscape version.
    Rejected because it directly conflicts with the feature scope.

## Decision 6: Keep the feature frontend-only in v1

- **Decision**: Do not add Route Handlers, persistence, or remote data fetching
  for this feature slice.
- **Rationale**: The current spec only requires the mobile shell, empty or
  introductory states, and navigation behavior. Adding backend contracts now
  would create unnecessary scope and false dependencies.
- **Alternatives considered**:
  - Add placeholder Route Handlers for future data.
    Rejected because the constitution only requires API boundaries when backend
    capabilities actually exist.
  - Add local persistence for records or selected tab.
    Rejected because neither persistence path is required for the first release.

## Decision 7: Record chart scope as explicit `N/A`

- **Decision**: Treat chart implementation as out of scope for this feature even
  though one screen is named “birdwatching index analysis”.
- **Rationale**: The constitution requires Apache ECharts when charts are in
  scope, and the spec explicitly marks charts as `N/A` for this shell feature.
  That keeps the shell and future analysis visualization work cleanly separated.
- **Alternatives considered**:
  - Add placeholder charts now.
    Rejected because the feature only needs an analysis screen shell.
  - Leave chart scope undocumented.
    Rejected because the constitution requires an explicit decision.
