# Research: Analysis Park Map Selector

## Decision 1: Add map as an analysis-screen-local surface

- **Decision**: Place the map panel in the analysis screen content directly
  below the fixed top navigation bar, not as a global shell-level widget.
- **Rationale**: The feature requirement is analysis-page scoped. Keeping the
  map local avoids unnecessary coupling with identify/records views and keeps
  existing shell contracts stable.
- **Alternatives considered**:
  - Global map mounted at shell level.
    Rejected because non-analysis screens do not need the map and would carry
    unnecessary rendering and interaction complexity.
  - Separate `/analysis-map` route.
    Rejected because requirement explicitly calls for in-page switching without
    full-page navigation changes.

## Decision 2: Use Tailwind CSS + shadcn/ui for map chrome

- **Decision**: Build layout, panel framing, and dropdown interaction with
  Tailwind CSS + shadcn/ui primitives; keep AMap usage limited to the map canvas
  and marker control logic.
- **Rationale**: This satisfies project constitution and user requirement while
  keeping visual consistency with the existing mobile shell.
- **Alternatives considered**:
  - Raw HTML `<select>` with custom CSS only.
    Rejected because shadcn/ui provides reusable interaction patterns and better
    consistency across the feature.
  - External UI framework for map controls.
    Rejected because it violates the approved UI stack.

## Decision 3: Use AMap JSAPI v2.0 via loader with explicit lifecycle control

- **Decision**: Initialize AMap through `@amap/amap-jsapi-loader`, configure
  security settings before load, and call `map.destroy()` on component unmount.
- **Rationale**: Skill guidance marks security config as mandatory and lifecycle
  destruction as required to avoid WebGL context leaks.
- **Alternatives considered**:
  - Embed script tag and global map bootstrap without loader abstraction.
    Rejected due to weaker control over plugin loading and lifecycle handling.
  - Keep map instance alive globally across route views.
    Rejected because this feature is scoped to analysis panel and global map
    persistence would complicate state isolation.

## Decision 4: Keep park data as local fixed presets

- **Decision**: Store four parks (Shenzhen Bay, Shenzhen East Lake, Bijia
  Mountain, Fairy Lake Botanical Garden) as local constants with labels and
  coordinates.
- **Rationale**: The feature requires a finite preset list and no backend data
  integration for this release.
- **Alternatives considered**:
  - Load parks from remote API.
    Rejected because current specification defines no backend contract.
  - Allow arbitrary user search input.
    Rejected because out of scope and would introduce new UX and data concerns.

## Decision 5: Ensure final-selection-wins behavior for rapid switching

- **Decision**: Treat park selection as authoritative state; when selections
  happen rapidly, always apply the latest selected park to map center and marker.
- **Rationale**: The spec requires deterministic final state under high-frequency
  interaction.
- **Alternatives considered**:
  - Disable dropdown during each map transition.
    Rejected because it degrades responsiveness and is unnecessary for simple
    center/marker updates.
  - Queue all selections sequentially.
    Rejected because intermediate states provide little value and can increase
    visible jitter.

## Decision 6: Handle AMap keys with environment-based configuration

- **Decision**: Consume AMap Web key and security code from environment values
  at runtime (for development), and document proxy-based `serviceHost` setup as
  production best practice.
- **Rationale**: AMap v2.0 requires security configuration before loading. Skill
  guidance recommends avoiding security code exposure in production deployments.
- **Alternatives considered**:
  - Hardcode key/security code in source files.
    Rejected for security and maintainability reasons.
  - Add proxy route in this feature slice.
    Rejected as out-of-scope for current frontend-only requirement, but retained
    as a follow-up hardening path.

## Decision 7: Keep chart scope explicitly out of this feature

- **Decision**: Document chart usage as `N/A` and avoid introducing Apache
  ECharts for this map-only change.
- **Rationale**: Constitution requires explicit chart scoping. This feature
  introduces geospatial map interaction, not chart rendering.
- **Alternatives considered**:
  - Add chart placeholders in analysis view together with map.
    Rejected because it expands scope beyond approved feature goals.
