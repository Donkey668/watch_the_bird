# Data Model: 分析总览核心信息

## Overview

This feature adds no persistent storage. It extends the existing analysis
integration model with a Beijing-time-driven overview snapshot derived from the
current birding outlook response.

## Entities

### BeijingTimeContext

**Purpose**: Represents the server-derived Beijing time used to explain the
overview at render time.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `displayText` | string | User-visible Beijing time in `YYYY年M月D日 HH:mm` format |
| `isoTimestamp` | string | ISO timestamp of the same Beijing-time instant for traceability |
| `monthNumber` | integer | Beijing month used for migration signal mapping |
| `minutesSinceMidnight` | integer | Internal derived minute offset used for habitat-activity rules |

**Validation rules**:

- `displayText` must always follow the `YYYY年M月D日 HH:mm` display format.
- `monthNumber` must be between 1 and 12.
- `minutesSinceMidnight` must be between 0 and 1439.

**Relationships**:

- One `BeijingTimeContext` belongs to one `AnalysisOverviewSnapshot`.

### HabitatActivitySummary

**Purpose**: Represents the overview’s habitat activity value derived from the
current birding index and Beijing time window.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Fixed display label `栖息地活跃度` |
| `value` | enum | `较高`, `中等`, `较低`, or `暂不可用` |
| `status` | enum | `success` or `unavailable` |

**Validation rules**:

- `value` must remain within the four supported labels.
- `status = unavailable` requires `value = 暂不可用`.
- `status = success` requires one of `较高`, `中等`, `较低`.

**Relationships**:

- One `HabitatActivitySummary` belongs to one `AnalysisOverviewSnapshot`.
- Its derivation depends on one `BirdingIndexAssessment` plus one
  `BeijingTimeContext`.

### MigrationSignalSummary

**Purpose**: Represents the overview’s month-derived migration signal.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Fixed display label `迁徙信号` |
| `value` | enum | `极高`, `较高`, `中等`, or `较低` |

**Validation rules**:

- `value` must always match the configured month mapping.
- The same Beijing month must always resolve to the same `value`.

**Relationships**:

- One `MigrationSignalSummary` belongs to one `AnalysisOverviewSnapshot`.
- Its derivation depends only on one `BeijingTimeContext`.

### ObservationConfidenceSummary

**Purpose**: Represents the fixed observation-confidence line shown in the
overview.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Fixed display label `观测可信度` |
| `value` | string | Fixed display value `稳定` |

**Validation rules**:

- `value` must always be `稳定`.

**Relationships**:

- One `ObservationConfidenceSummary` belongs to one `AnalysisOverviewSnapshot`.

### AnalysisOverviewSnapshot

**Purpose**: Represents the render-ready overview block returned to the
analysis screen.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Fixed section title `分析总览` |
| `beijingTime` | object | Serialized `BeijingTimeContext` |
| `habitatActivity` | object | Serialized `HabitatActivitySummary` |
| `migrationSignal` | object | Serialized `MigrationSignalSummary` |
| `observationConfidence` | object | Serialized `ObservationConfidenceSummary` |

**Validation rules**:

- `title` must always be `分析总览`.
- The snapshot must never expose a separate current time-slot label.
- `habitatActivity.value` must be `暂不可用` when the birding index is
  unavailable.

**Relationships**:

- One `AnalysisOverviewSnapshot` belongs to one `BirdingOutlookResponse`.

### BirdingOutlookResponse (Extended)

**Purpose**: Represents the normalized API response sent to the analysis page.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `requestStatus` | enum | `success`, `partial`, `invalid_park`, or `failed` |
| `message` | string | Status summary for the current request |
| `requestedAt` | string | Endpoint processing time |
| `park` | object | Current park context |
| `weather` | object/null | Current weather snapshot |
| `birdingIndex` | object/null | Current birding-index result |
| `analysisOverview` | object/null | Current analysis overview snapshot |

**Validation rules**:

- `requestStatus = success` requires non-null `weather`, `birdingIndex`, and
  `analysisOverview`.
- `requestStatus = partial` requires usable `weather`, an unavailable
  `birdingIndex`, and an `analysisOverview` whose habitat activity is
  `暂不可用`.
- `requestStatus = failed` or `invalid_park` must not include stale overview
  data from earlier selections.

## Derived State Rules

- Beijing time is the only valid source for date, time, and month mapping.
- Habitat activity is derived from birding index + Beijing time window only.
- Migration signal is derived from Beijing month only.
- Observation confidence is constant and does not depend on weather or birding
  availability.
- The overview must not expose or render a visible “当前时段” label.

## State Transitions

### Success

1. Route resolves current park, weather, and birding index.
2. Server derives Beijing time context and overview snapshot.
3. Frontend renders weather card followed by overview card.

### Partial Success

1. Weather query succeeds.
2. Birding index becomes unavailable.
3. Server still derives Beijing time and migration/observation lines.
4. Habitat activity resolves to `暂不可用`.
5. Frontend renders the overview with that degraded habitat value.

### Full Failure

1. Park lookup fails or weather snapshot cannot be used.
2. No reliable overview snapshot is returned.
3. Frontend must not render stale overview values from an earlier request.
