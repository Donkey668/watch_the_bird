# Research: Analysis Weather and Birding Index

## Decision 1: Keep one server-side aggregation endpoint

- **Decision**: Continue exposing `GET /api/analysis/birding-outlook?parkId=...`
  as the only frontend entry point.
- **Rationale**: The frontend should keep a single request model and remain
  isolated from upstream weather services.
- **Alternatives considered**:
  - Split weather and birding index into separate endpoints.
    Rejected because it adds client orchestration without user value.
  - Call AMap directly from the browser.
    Rejected because credentials and normalization rules must stay server-side.

## Decision 2: Keep district lookup tied to preset parks

- **Decision**: Continue mapping each preset park to district metadata in
  `lib/maps/park-options.ts`.
- **Rationale**: AMap weather is queried by district code, while the product is
  driven by preset park selection.
- **Alternatives considered**:
  - Runtime reverse geocoding from coordinates.
    Rejected because the park list is fixed and district metadata is stable.

## Decision 3: Continue using AMap weather GET + JSON parsing

- **Decision**: Continue composing the weather request with a GET URL to
  `https://restapi.amap.com/v3/weather/weatherInfo` and parse JSON only.
- **Rationale**: This matches the project requirement and keeps the weather
  normalization pipeline unchanged.
- **Alternatives considered**:
  - XML response parsing.
    Rejected because JSON already satisfies the feature.

## Decision 4: Replace the LLM with a fixed local weighted algorithm

- **Decision**: Remove the DashScope/OpenAI step and compute birding index on
  the server from normalized weather data using fixed weights and fixed score
  tables.
- **Rationale**: The user explicitly replaced the QWen flow with a deterministic
  local algorithm and provided exact scoring rules.
- **Alternatives considered**:
  - Keep the LLM and adjust the prompt.
    Rejected because the user explicitly asked to弃用 that flow.
  - Score only from weather phenomenon.
    Rejected because the requirement includes wind, temperature, and humidity.

## Decision 5: Treat unsupported or unparsable scoring inputs as partial success

- **Decision**: If weather lookup succeeds but any required scoring field cannot
  be mapped or parsed, return `requestStatus = partial` with weather visible and
  birding index unavailable.
- **Rationale**: Valid weather data should remain visible even when the local
  scorer cannot produce a trustworthy result.
- **Alternatives considered**:
  - Guess a fallback score for unsupported values.
    Rejected because the scoring rules are required to stay fixed and explicit.
  - Fail the whole endpoint.
    Rejected because it would hide usable weather information.

## Decision 6: Keep the existing panel UI and request sequencing

- **Decision**: Preserve the current panel location, shadcn/ui composition, and
  final-selection-wins refresh behavior.
- **Rationale**: The change is about the scoring engine, not the frontend
  interaction model.
- **Alternatives considered**:
  - Introduce a new route or dedicated score page.
    Rejected because the feature remains analysis-page local.

## Decision 7: Keep chart scope out of this feature

- **Decision**: Continue treating charts as `N/A` for this feature.
- **Rationale**: The current slice is still a summary card experience rather
  than a chart visualization feature.
- **Alternatives considered**:
  - Add weather trend charts.
    Rejected because no forecast timeline is required in this scope.
