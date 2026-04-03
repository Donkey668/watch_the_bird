# Data Model: 天气与观鸟指数预报预警弹窗

## Overview

This feature adds no persistent database schema. It defines one aggregated
forecast-warning response model composed from four upstream Shenzhen Open Data
datasets and one modal-local warning detail interaction model.

## Entities

### ForecastWarningRequestContext

**Purpose**: Represents one modal data request scoped to the selected park.

| Field | Type | Description |
|-------|------|-------------|
| `parkId` | string | Current map-selected park identifier |
| `districtName` | string | District name resolved from configured park options |
| `districtCode` | string | District code from configured park options |
| `requestedAt` | string | Server timestamp for this aggregation request |
| `beijingNow` | string | Current Beijing time used for filter windows |

**Validation rules**:

- `parkId` must match one configured park.
- `districtName` and `districtCode` must come from the matched park.
- Invalid park input returns `requestStatus = invalid_park`.

### ForecastWarningModuleState

**Purpose**: Common module-level status envelope to keep four sections
independent.

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `success`, `empty`, `failed` |
| `message` | string | Module-level Simplified Chinese display message |
| `source` | string | Upstream dataset identifier |
| `returnedCount` | number | Number of records returned after server filtering |

**Validation rules**:

- `failed` must include a user-readable fallback message.
- `empty` must be used when request succeeds but no effective rows remain after filtering.
- Module status must not be inferred from other module results.

### HourlyForecastItem

**Purpose**: One card item in `分区逐时预报`.

| Field | Type | Description |
|-------|------|-------------|
| `recId` | string | `RECID` normalized to string |
| `areaName` | string | `AREANAME` after district filtering |
| `forecastTime` | string | `DDATETIME` display value |
| `weatherStatus` | string | `WEATHERSTATUS` display value |
| `qpfTemp` | string | `QPFTEMP` display value |
| `writeTime` | string | `WRITETIME` or `CRTTIME` normalized |
| `isWarning` | string | `ISWARNING` original flag when available |

**Validation rules**:

- Must keep only rows with valid `DDATETIME` after current Beijing time.
- Card display order is fixed: `WEATHERSTATUS` -> `QPFTEMP` -> `DDATETIME`.

### DistrictForecastItem

**Purpose**: One card item in `分区预报`.

| Field | Type | Description |
|-------|------|-------------|
| `recId` | string | `RECID` normalized to string |
| `areaName` | string | `AREANAME` after district filtering |
| `forecastTime` | string | `DDATETIME` display value |
| `weatherStatus` | string | `WEATHERSTATUS` display value |
| `minTemperature` | string | `MINTEMPERATURE` display value |
| `maxTemperature` | string | `MAXTEMPERATURE` display value |

**Validation rules**:

- Must keep only rows with date >= current Beijing date.
- Card display order is fixed: `WEATHERSTATUS` -> `MINTEMPERATURE/MAXTEMPERATURE` -> `DDATETIME`.

### SunMoonTimingItem

**Purpose**: One line item in `日月时刻`.

| Field | Type | Description |
|-------|------|-------------|
| `keyId` | string | `KEYID` normalized to string |
| `forecastTime` | string | `DDATETIME` display value |
| `attribName` | string | `ATTRIBNAME` display label |
| `attribValue` | string | `ATTRIBVALUE` display value |

**Validation rules**:

- Keep only rows for current Beijing date.
- Each rendered row requires both `attribName` and `attribValue` non-empty.

### DisasterWarningItem

**Purpose**: One warning row in `灾害预警` plus detail popup source.

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | number | Frontend display index starting at 1 |
| `issueTime` | string | `ISSUETIME` display value |
| `issueState` | string | `ISSUESTATE` upstream value |
| `signalType` | string | `SIGNALTYPE` display value |
| `signalLevel` | string | `SIGNALLEVEL` display value |
| `issueContent` | string | `ISSUECONTENT` detail body |
| `district` | string | `DISTRICT` detail district |
| `textColorToken` | string | Tailwind token resolved from `SIGNALLEVEL` |
| `isPlaceholder` | boolean | Whether this row is the `当前无生效信号。` fallback |

**Validation rules**:

- Effective warning rows require `ISSUESTATE = 发布` and no later `取消` for same
  signal identity.
- If `signalType` exists but `signalLevel` is empty, `textColorToken` must map
  to yellow.
- If both `signalType` and `signalLevel` are empty, row must become one gray
  placeholder with `isPlaceholder = true`.

### ForecastWarningAggregatedResponse

**Purpose**: Route Handler response model consumed by the modal.

| Field | Type | Description |
|-------|------|-------------|
| `requestStatus` | enum | `success`, `partial`, `invalid_park`, `failed` |
| `message` | string | Top-level summary message |
| `requestedAt` | string | Request timestamp |
| `park` | object/null | Park and district context |
| `hourlyForecast` | object | `ForecastWarningModuleState` + `HourlyForecastItem[]` |
| `districtForecast` | object | `ForecastWarningModuleState` + `DistrictForecastItem[]` |
| `sunMoonTiming` | object | `ForecastWarningModuleState` + `SunMoonTimingItem[]` |
| `disasterWarning` | object | `ForecastWarningModuleState` + `DisasterWarningItem[]` |

**Validation rules**:

- `success` means all modules are `success` or `empty`.
- `partial` means at least one module is `failed` while others still provide
  renderable data.
- `failed` means no module has renderable data due to transport/system failure.
- `invalid_park` omits module datasets and returns only parameter error info.

## State Transitions

### Weather Panel To Modal Loading

1. User clicks `点击获取预报预警`.
2. Modal opens immediately on top layer.
3. Frontend requests aggregated forecast-warning data for current `parkId`.

### Modal Loading To Full/Partial Render

1. Route Handler returns normalized module payloads.
2. Frontend renders each module by its independent `status`.
3. Top-level status becomes `success` or `partial`.

### Modal Render To Park-Switched Refresh

1. User changes park in map context.
2. Next modal request binds to new district context.
3. Previous district results are treated as stale and must not remain visible as current data.

### Warning Row To Detail Dialog

1. User taps one non-placeholder warning line.
2. Detail dialog opens and renders `ISSUECONTENT` + `DISTRICT`.
3. Closing detail dialog returns focus to the warning list in the parent modal.
