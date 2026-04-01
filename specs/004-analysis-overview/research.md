# Research: 分析总览核心信息

## Decision 1: Reuse the existing analysis aggregation endpoint

- **Decision**: Keep `GET /api/analysis/birding-outlook?parkId=...` as the
  only frontend-facing endpoint and extend its success and partial-success
  payload with one `analysisOverview` object.
- **Rationale**: The weather panel and overview panel describe the same park
  selection and should remain consistent under one backend contract and one
  client request lifecycle.
- **Alternatives considered**:
  - Add a second `/api/analysis/overview` endpoint.
    Rejected because it would create duplicate orchestration and increase the
    risk of time drift or stale mismatch between panels.
  - Compute the overview entirely in the browser.
    Rejected because the feature explicitly requires Beijing time rather than
    device-local time, and server-side derivation is more consistent.

## Decision 2: Derive Beijing time on the server with a fixed display format

- **Decision**: Generate overview time context on the server with
  `Asia/Shanghai` as the timezone source and expose one display string in the
  exact format `YYYY年M月D日 HH:mm`.
- **Rationale**: This guarantees the overview always reflects Beijing time even
  when the browser runs in another timezone, and it matches the user’s fixed
  display requirement.
- **Alternatives considered**:
  - Use the browser’s local clock.
    Rejected because it can diverge from Beijing time.
  - Return raw timestamps only and let the client format them.
    Rejected because client locale and timezone differences can produce an
    inconsistent user-visible result.

## Decision 3: Compute habitat activity from birding index plus time windows

- **Decision**: Implement one pure rules helper that maps the existing birding
  index result and current Beijing time into the final habitat activity value:
  `较高` / `中等` / `较低` / `暂不可用`.
- **Rationale**: The rule table is deterministic and should live in a single
  testable place instead of being duplicated across UI branches.
- **Alternatives considered**:
  - Encode rules directly inside React render branches.
    Rejected because it is harder to audit and validate against boundary times.
  - Expose the current time slot name and let the client decide the value.
    Rejected because the UI must not explicitly show the time slot label and
    the mapping should remain centralized.

## Decision 4: Do not display a “current time slot” label in the UI

- **Decision**: Use time-window rules internally but do not include a separate
  time-slot label such as `09:00–12:00` in the response payload or visible UI.
- **Rationale**: The user explicitly clarified that the overview should not
  show a current slot label.
- **Alternatives considered**:
  - Show the slot label under the time string.
    Rejected because it violates the clarified UX requirement.
  - Hide the slot label in UI but keep it in the public API contract.
    Rejected because the client does not need it for rendering.

## Decision 5: Treat migration signal as a month-only mapping

- **Decision**: Derive migration signal exclusively from the current Beijing
  month with the fixed mapping: `极高` / `较高` / `中等` / `较低`.
- **Rationale**: The user supplied a complete month table and did not ask for
  live migration datasets or park-specific adjustments.
- **Alternatives considered**:
  - Add district or weather influence to migration signal.
    Rejected because no such rule was requested.
  - Introduce a third-party migration source.
    Rejected because it adds scope and dependency cost without requirement support.

## Decision 6: Keep observation confidence fixed in the response

- **Decision**: Always return `稳定` for observation confidence as a literal
  fixed value in the overview object.
- **Rationale**: The user explicitly defined observation confidence as fixed,
  so no additional logic or state is needed.
- **Alternatives considered**:
  - Infer confidence from weather completeness or API status.
    Rejected because it conflicts with the clarified fixed-value rule.

## Decision 7: Partial success keeps overview partially renderable

- **Decision**: When weather data is available but birding index is
  unavailable, still return Beijing time, migration signal, and observation
  confidence, while setting habitat activity to `暂不可用`.
- **Rationale**: This matches the clarified requirement and preserves useful
  information without fabricating a habitat level.
- **Alternatives considered**:
  - Hide the whole overview on birding-index failure.
    Rejected because the user asked for a specific degraded behavior.
  - Reuse the last successful habitat activity value.
    Rejected because it can mislead users after refreshes or park switches.

## Decision 8: Render the overview as a dedicated panel below the weather card

- **Decision**: Add a dedicated local component for the overview panel below
  the existing weather and birding card, reusing `Card`, `Separator`, and
  Tailwind layout primitives.
- **Rationale**: This preserves the requested layout order while keeping the
  placeholder removal localized to the analysis feature surface.
- **Alternatives considered**:
  - Keep the old `analysis-screen.tsx` placeholder card and only swap its text.
    Rejected because the current structure contains extra placeholder titles and
    descriptions the user explicitly wants removed.
  - Merge overview rows into the existing weather card body.
    Rejected because the user asked for the overview region below the weather
    and birding section.
