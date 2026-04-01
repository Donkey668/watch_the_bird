# Research: Analysis Weather and Birding Index

## Decision 1: Use one server-side aggregation endpoint for the analysis panel

- **Decision**: Expose a single Route Handler at
  `GET /api/analysis/birding-outlook?parkId=...` that performs district
  lookup, weather query, LLM judgment, and response normalization before the
  frontend renders results.
- **Rationale**: This preserves the required App Router API boundary and keeps
  the browser from directly calling either the AMap Weather API or the
  DashScope-compatible LLM endpoint.
- **Alternatives considered**:
  - Frontend directly calls AMap Weather API and LLM.
    Rejected because it violates the constitution and would expose credentials
    and prompt logic to the browser.
  - Split into separate `/weather` and `/birding-index` endpoints.
    Rejected because the analysis page needs a single cohesive response and a
    split design would create more client orchestration without user value.

## Decision 2: Extend park presets with district lookup metadata

- **Decision**: Add district-level metadata to each preset park, including a
  district display name and AMap-compatible district code used for weather
  lookup.
- **Rationale**: The feature is driven by the currently selected park, while
  the weather service is queried by administrative district rather than by the
  map marker itself.
- **Alternatives considered**:
  - Infer district from coordinates at runtime using reverse geocoding.
    Rejected because it adds another upstream dependency and more latency for a
    fixed set of four parks.
  - Query weather by city only.
    Rejected because the requirement is district-level weather tied to the park.

## Decision 3: Query AMap weather through a composed GET URL and JSON parsing

- **Decision**: Compose the weather request as a server-side GET URL for
  `https://restapi.amap.com/v3/weather/weatherInfo`, always including the
  required `key` query parameter, district query parameter, and JSON response
  mode. Parse the returned JSON and normalize only the fields needed by the UI
  and LLM.
- **Rationale**: This matches the user-mandated integration pattern and avoids
  XML parsing complexity when JSON is available.
- **Alternatives considered**:
  - XML response parsing.
    Rejected because the feature has no XML-specific need and JSON lowers
    parsing overhead.
  - Another weather provider.
    Rejected because the user explicitly mandated the AMap weather endpoint.

## Decision 4: Render all weather fields that the configured weather endpoint returns reliably

- **Decision**: Treat the normalized weather snapshot as the contract source of
  truth and surface the district name, weather description, temperature,
  humidity, wind direction, wind power, and report time as the baseline
  displayable fields; include any additional returned field only if it is
  consistently present for the chosen AMap response mode.
- **Rationale**: The user asked to display all queried weather information, but
  the actual field set depends on the upstream endpoint. The UI should be
  faithful to the parsed payload instead of inventing unsupported metrics.
- **Alternatives considered**:
  - Hardcode a larger set of weather attributes regardless of upstream support.
    Rejected because it risks empty or misleading placeholders.
  - Reduce the UI to birding index only.
    Rejected because the feature explicitly requires weather details beneath the map.

## Decision 5: Use OpenAI SDK with DashScope-compatible base URL and structured JSON output

- **Decision**: Use the `openai` SDK on the server with
  `baseURL=https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1`,
  `apiKey=process.env.DASHSCOPE_API_KEY`, model `qwen3.5-plus`, and JSON object
  output mode via `response_format: { type: "json_object" }` so the model
  returns a machine-readable result.
- **Rationale**: This exactly matches the user-provided SDK pattern while
  ensuring the frontend receives a deterministic object rather than free-form text.
- **Alternatives considered**:
  - Plain text model output followed by regex or string parsing.
    Rejected because it is brittle and increases failure risk for a
    three-value classification problem.
  - A different LLM SDK or endpoint shape.
    Rejected because the user explicitly mandated the compatible OpenAI SDK flow.

## Decision 6: Constrain the LLM to a single enum-bearing object

- **Decision**: Use a tightly scoped system prompt that instructs the model to
  output JSON only, with one birding index field whose value must be exactly
  one supported enum label. The route handler will reject any other value as
  invalid upstream output. The expected object shape is
  `{ "birdingIndex": "<enum>" }`.
- **Rationale**: The feature needs direct renderability and should not depend on
  client-side interpretation of verbose AI output.
- **Alternatives considered**:
  - Allow the model to return explanatory prose with a suggested level.
    Rejected because it complicates parsing and weakens deterministic rendering.
  - Add multi-field reasoning text as mandatory response content.
    Rejected because the user only requires direct birding index data.

## Decision 7: Treat weather success and AI success as separate availability states

- **Decision**: Return partial success when weather data is available but AI
  classification fails, so the UI can still render the weather snapshot while
  marking the birding index as unavailable.
- **Rationale**: Weather data remains useful even if the LLM step fails, and
  the specification explicitly calls for understandable degraded states.
- **Alternatives considered**:
  - Fail the entire response if the AI call fails.
    Rejected because it hides valid weather data and reduces resilience.
  - Cache stale birding index results from a previous park selection.
    Rejected because it can mislead users when selections change rapidly.

## Decision 8: Keep the panel local to the analysis screen and reuse shadcn/ui surfaces

- **Decision**: Add one analysis-screen-local panel below the map and compose
  it from existing shadcn/ui primitives such as `Card`, `Button`, and
  `Separator`, with Tailwind layout for responsive stacking.
- **Rationale**: The feature is analysis-scoped and should preserve the current
  mobile shell routing and design language.
- **Alternatives considered**:
  - Create a separate weather details page.
    Rejected because the user explicitly wants the block under the map.
  - Introduce a new component framework for the data summary layout.
    Rejected because it violates the approved UI stack.

## Decision 9: Keep chart scope explicitly out of this feature

- **Decision**: Document chart usage as `N/A` and do not introduce Apache
  ECharts in this slice.
- **Rationale**: The feature is a weather summary plus birding suitability
  judgment, not a charting experience.
- **Alternatives considered**:
  - Add weather trend charts below the index.
    Rejected because neither the user request nor the current data source
    requires chart visualization in this iteration.
