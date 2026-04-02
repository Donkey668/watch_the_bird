# Data Model: Analysis Weather and Birding Index

## Overview

This feature introduces no persistent database schema. The data model is an
integration-state model that aggregates preset park context, district weather,
and a locally computed birding index for rendering on the analysis screen.

## Entities

### ParkWeatherContext

**Purpose**: Represents the selected preset park and the district metadata
required for AMap weather lookup.

| Field | Type | Description |
|-------|------|-------------|
| `parkId` | enum | Stable preset park identifier |
| `parkName` | string | Display name used by the UI |
| `cityName` | string | City label for the park |
| `districtName` | string | District or county label used in weather context |
| `districtCode` | string | AMap-compatible weather query value |
| `isDefault` | boolean | Whether the park is the default selection |

### DistrictWeatherSnapshot

**Purpose**: Represents the normalized weather payload returned for the
selected district.

| Field | Type | Description |
|-------|------|-------------|
| `districtName` | string | Resolved district name |
| `districtCode` | string | Upstream query code |
| `weatherText` | string | Human-readable weather phenomenon |
| `temperature` | string | Returned temperature value |
| `humidity` | string | Returned humidity value |
| `windDirection` | string | Returned wind direction |
| `windPower` | string | Returned wind power or level |
| `reportTime` | string | Upstream report time |
| `rawStatus` | enum | `success` or `unavailable` |
| `rawPayload` | object | Parsed upstream payload retained for normalization |
| `details` | array | Render-ready weather rows for the UI |

### BirdingIndexAssessment

**Purpose**: Represents the locally computed birding suitability result for the
current weather snapshot.

| Field | Type | Description |
|-------|------|-------------|
| `level` | enum/null | `适宜` / `较适宜` / `不适宜` when scoring succeeds |
| `status` | enum | `success` or `unavailable` |
| `generatedAt` | string/null | Time the local scoring result was generated |
| `modelName` | string | Fixed local engine identifier, currently `local-weather-score-v1` |
| `rawResult` | object/null | Local score breakdown and weighted total |
| `failureReason` | string/null | Why the local scorer could not produce a result |

**Derived scoring fields inside `rawResult`**:

| Field | Type | Description |
|-------|------|-------------|
| `weatherKey` | string | Normalized weather text used for mapping |
| `weatherScore` | number | Fixed weather phenomenon score |
| `windLevel` | number | Parsed wind level used for scoring |
| `windScore` | number | Wind score |
| `temperature` | number | Parsed temperature |
| `temperatureScore` | number | Temperature score |
| `humidity` | number | Parsed humidity |
| `humidityScore` | number | Humidity score |
| `totalScore` | number | Final rounded weighted score |
| `weights` | object | Fixed weight table used for the calculation |

### BirdingOutlookResponse

**Purpose**: Represents the normalized API response sent to the frontend panel.

| Field | Type | Description |
|-------|------|-------------|
| `requestStatus` | enum | `success`, `partial`, `invalid_park`, or `failed` |
| `message` | string | User-facing summary of the current state |
| `requestedAt` | string | Time the endpoint handled the request |
| `park` | object | Serialized `ParkWeatherContext` |
| `weather` | object/null | Serialized `DistrictWeatherSnapshot` |
| `birdingIndex` | object/null | Serialized `BirdingIndexAssessment` |
| `analysisOverview` | object/null | Derived overview block below weather |

## Derived State Rules

- The frontend panel state must always correspond to the latest selected `parkId`.
- Weather availability and birding-index availability are separate states.
- A supported local score requires four valid dimensions: weather text, wind,
  temperature, and humidity.
- Final level mapping uses rounded score bands:
  - `80-100 => 适宜`
  - `60-79 => 较适宜`
  - `0-59 => 不适宜`

## State Transitions

### Initial Load

1. Resolve the default `ParkWeatherContext`.
2. Query district weather on the server.
3. Compute the local birding index if all required fields are usable.
4. Return `success`, `partial`, or `failed`.

### Park Switch

1. User selects another preset park.
2. The previous panel result becomes stale.
3. A fresh server request runs for the new district.
4. Only the newest response is committed to the UI.

### Partial Failure

1. Weather query succeeds.
2. Local scoring cannot map the current weather phenomenon or parse a required value.
3. The panel still shows weather, while birding index becomes unavailable.

### Full Failure

1. Park lookup fails or the weather request cannot produce a usable snapshot.
2. The panel shows a clear failure state and omits birding index output.
