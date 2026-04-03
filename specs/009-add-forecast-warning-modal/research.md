# Research: 天气与观鸟指数预报预警弹窗

## Decision 1: Use one aggregation Route Handler for all four modal modules

- **Decision**: Expose one frontend-facing endpoint,
  `GET /api/analysis/forecast-warning?parkId=...`, and let it aggregate four
  upstream Shenzhen Open Data interfaces server-side.
- **Rationale**: The modal opens as one user action and must render four
  independent modules under a single district context. One Route Handler keeps
  park-context switching and stale-state control consistent.
- **Alternatives considered**:
  - Frontend calls four upstream interfaces directly.
    Rejected because it violates Route Handler boundary and would expose
    `appKey`.
  - Create four frontend-called internal endpoints.
    Rejected because it increases client orchestration complexity without user
    value.

## Decision 2: Lock upstream interfaces and parameter baseline to user-provided APIs

- **Decision**: Integrate exactly these upstream JSON endpoints:
  - `https://opendata.sz.gov.cn/api/339779363/1/service.xhtml`
  - `https://opendata.sz.gov.cn/api/29200_00903517/1/service.xhtml`
  - `https://opendata.sz.gov.cn/api/1214604037/1/service.xhtml`
  - `https://opendata.sz.gov.cn/api/589826359/1/service.xhtml`
  and always send `appKey`, `page`, `rows`, with optional `startDate/endDate`
  when useful.
- **Rationale**: The user explicitly provided interface IDs, URL shape, and
  request parameter contract.
- **Alternatives considered**:
  - Reuse existing AMap weather interface for forecast/warning modules.
    Rejected because required fields (`DDATETIME`, `SIGNALTYPE`, etc.) come
    from the specified Shenzhen Open Data datasets.

## Decision 3: Use one shared server-only appKey environment variable

- **Decision**: Read `process.env.SZ_WEATHER_APP_KEY` in the server data-access
  layer and inject it into all four upstream requests as `appKey`.
- **Rationale**: The user requires one common appKey across all forecast/warning
  interfaces. Server-only access avoids credential exposure.
- **Alternatives considered**:
  - Separate appKeys per upstream endpoint.
    Rejected because the user asked for one shared key.
  - Pass appKey from frontend query parameters.
    Rejected for security and architectural reasons.

## Decision 4: Apply on-demand fetch windows and bounded row counts

- **Decision**: Keep upstream pagination at `page=1` and bounded `rows` per
  module, and use `startDate/endDate` windows for time-scoped modules to reduce
  returned volume.
- **Rationale**: The datasets are large and the user explicitly requires
  consumption reduction.
- **Alternatives considered**:
  - Fetch very large pages (near max 10000) by default.
    Rejected because it increases latency and unnecessary payload consumption.
  - Paginate through multiple pages on first modal open.
    Rejected because the modal only needs immediate current-context data.

## Decision 5: Normalize and filter by selected park district and Beijing time

- **Decision**: Server normalizes all upstream rows and filters by selected
  district plus time rules:
  - Hourly: `DDATETIME` after current Beijing time.
  - District forecast: today and later by `DDATETIME`.
  - Sun/moon: today only by `DDATETIME`.
  - Warnings: currently valid rows where `ISSUESTATE=发布` and no later
    cancellation for the same signal.
- **Rationale**: Business rules are defined by the feature description and must
  be deterministic before rendering.
- **Alternatives considered**:
  - Let frontend perform all filtering.
    Rejected because it duplicates logic and complicates correctness under
    district switches.
  - Trust upstream ordering without local filtering.
    Rejected because requirements depend on current-time validity.

## Decision 6: Keep four module states independent in one payload

- **Decision**: Response payload includes module-level status/data blocks so any
  module can fail independently while others still render.
- **Rationale**: Feature requires four modules to be independent.
- **Alternatives considered**:
  - Fail entire modal when one upstream call fails.
    Rejected because it hides available information and breaks resilience.

## Decision 7: Define deterministic disaster warning display behavior

- **Decision**: Normalize warning rows into:
  - render text format `序号 SIGNALTYPE SIGNALLEVEL预警`
  - color by `SIGNALLEVEL`
  - default yellow when `SIGNALTYPE` exists but `SIGNALLEVEL` is empty
  - fallback `当前无生效信号。` in gray when both are empty
  - details popup content from `ISSUECONTENT` and `DISTRICT`
- **Rationale**: The warning list has strict user-defined formatting and fallback
  rules.
- **Alternatives considered**:
  - Show raw warning rows directly.
    Rejected because raw data would not match requested format and fallback
    behavior.

## Decision 8: Implement modal UI with existing shadcn Dialog primitives

- **Decision**: Use existing `components/ui/dialog.tsx` for both top-layer
  forecast-warning modal and nested warning-detail popup; build section cards
  using existing Tailwind + shadcn style.
- **Rationale**: Matches repository UI standard and avoids adding a new modal
  framework.
- **Alternatives considered**:
  - Add a new modal library.
    Rejected because existing dialog primitives already satisfy requirements.

## Decision 9: Keep chart scope explicitly out of this slice

- **Decision**: Mark Apache ECharts usage as `N/A`.
- **Rationale**: Feature requires card/list/modal presentation only.
- **Alternatives considered**:
  - Add forecast trend charts.
    Rejected because not requested and would expand scope.
