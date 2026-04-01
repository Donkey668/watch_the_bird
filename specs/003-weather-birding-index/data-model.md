# Data Model: Analysis Weather and Birding Index

## Overview

This feature introduces no persistent database schema. The data model is an
integration-state model that aggregates park context, district weather, and an
AI-generated birding index for rendering on the analysis screen.

## Entities

### ParkWeatherContext

**Purpose**: Represents the selected preset park and the district metadata
required for weather lookup.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `parkId` | enum | Stable preset park identifier from the map selector |
| `parkName` | string | Display name shown in map and outlook panel |
| `cityName` | string | City label for display context |
| `districtName` | string | District or county-level label used in the panel |
| `districtCode` | string | AMap-compatible district query value |
| `isDefault` | boolean | Whether this park is the default selection |

**Validation rules**:

- `parkId` must match one configured preset park.
- `districtCode` must be present for every supported park.
- `districtName` and `districtCode` must describe the same district.

**Relationships**:

- One `ParkWeatherContext` maps to zero or one `DistrictWeatherSnapshot`.
- One `ParkWeatherContext` maps to zero or one `BirdingIndexAssessment`.

### DistrictWeatherSnapshot

**Purpose**: Represents the normalized weather payload returned for the
selected district.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `districtName` | string | Resolved district or county-level name |
| `districtCode` | string | Upstream query value used for the weather request |
| `weatherText` | string | Human-readable weather summary from the upstream service |
| `temperature` | string | Current or returned temperature value |
| `humidity` | string | Returned humidity value |
| `windDirection` | string | Returned wind direction |
| `windPower` | string | Returned wind power or level |
| `reportTime` | string | Upstream weather update time |
| `rawStatus` | enum | `success` or `unavailable` |
| `rawPayload` | object | Parsed upstream payload retained for normalization/debug use |

**Validation rules**:

- `districtCode` must match the queried `ParkWeatherContext`.
- `weatherText` must be present when `rawStatus = success`.
- `reportTime` must be present when the weather payload is considered usable.

**Relationships**:

- One `DistrictWeatherSnapshot` is produced from one `ParkWeatherContext`.
- One `DistrictWeatherSnapshot` is the only weather input to one
  `BirdingIndexAssessment`.

### BirdingIndexAssessment

**Purpose**: Represents the AI-generated suitability judgment for same-day
birding conditions.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `level` | enum | One of `适宜`, `较适宜`, `不适宜` |
| `status` | enum | `success` or `unavailable` |
| `generatedAt` | string | Time the assessment was created |
| `modelName` | string | LLM model identifier used for generation |
| `rawResult` | object | Parsed JSON object returned by the model |
| `failureReason` | string/null | Reason the assessment is unavailable |

**Validation rules**:

- `level` must never contain values outside the three supported labels.
- `rawResult` must include the same enum-bearing value when `status = success`.
- `failureReason` must be populated when `status = unavailable`.

**Relationships**:

- One `BirdingIndexAssessment` is derived from one `DistrictWeatherSnapshot`.
- One `BirdingIndexAssessment` is attached to one `BirdingOutlookResponse`.

### BirdingOutlookResponse

**Purpose**: Represents the normalized API response sent to the frontend panel.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `park` | object | Serialized `ParkWeatherContext` |
| `weather` | object/null | Serialized `DistrictWeatherSnapshot` |
| `birdingIndex` | object/null | Serialized `BirdingIndexAssessment` |
| `requestStatus` | enum | `success`, `partial`, `invalid_park`, or `failed` |
| `message` | string | User-facing summary for current state |
| `requestedAt` | string | Time the endpoint processed the request |

**Validation rules**:

- `requestStatus = success` requires both `weather` and `birdingIndex`.
- `requestStatus = partial` requires valid `weather` and unavailable
  `birdingIndex`.
- `requestStatus = invalid_park` must not include weather or birding data.

**Relationships**:

- One `BirdingOutlookResponse` wraps at most one weather snapshot and one
  birding index assessment for the selected park.

## Derived State Rules

- The frontend panel state must always correspond to the currently selected
  `parkId`.
- A later park selection invalidates all earlier in-flight responses for UI
  rendering.
- Weather availability and birding-index availability are separate states and
  must not be collapsed into a single boolean.

## State Transitions

### Initial Load

1. Resolve the default `ParkWeatherContext`.
2. Request the server endpoint with the default `parkId`.
3. Render loading state below the map.
4. Transition to `success`, `partial`, or `failed` once the response returns.

### Park Switch

1. User selects another park in the map panel.
2. The outlook panel marks previous response as stale and enters loading state.
3. A new server request runs for the selected district.
4. Only the most recent response is committed to the UI.

### Partial Failure

1. Weather query succeeds.
2. AI classification fails or returns invalid JSON/enum.
3. The panel renders normalized weather data and a birding-index-unavailable state.

### Full Failure

1. Park lookup fails or the weather request cannot produce usable data.
2. The panel renders a clear error state and omits the birding index result.
