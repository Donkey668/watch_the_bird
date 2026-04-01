# Data Model: 栖息地鸟种参考

## Overview

This feature introduces no database persistence. It reads local JSON source
assets, normalizes bird species rows for one selected park, and returns either
a preview slice or the full list to the analysis screen.

## Entities

### ParkSpeciesDataSource

**Purpose**: Represents the server-side mapping between a preset park and its
JSON source file.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `parkId` | string | Existing preset park identifier from `lib/maps/park-options.ts` |
| `parkName` | string | Human-readable park name used in the UI response |
| `fileName` | string | JSON filename inside `parkinfo/` |
| `absolutePath` | string | Resolved server-only source path |
| `sourceStatus` | enum | `available`, `missing`, or `unreadable` |

**Validation rules**:

- `parkId` must map to an existing preset park.
- `fileName` must end with `.json`.
- `sourceStatus = available` requires the JSON source file to exist and be readable.

**Relationships**:

- One `ParkSpeciesDataSource` belongs to one preset park.
- One source can produce many `BirdSpeciesRecord` rows.

### SpeciesReferenceRequest

**Purpose**: Represents the frontend query made for preview or full loading.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `parkId` | string | Selected preset park identifier |
| `view` | enum | `preview` or `full` |

**Validation rules**:

- `parkId` must match a known preset park.
- `view` defaults to `preview` when omitted.
- Any value outside `preview` and `full` is invalid.

**Relationships**:

- One request resolves exactly one `ParkSpeciesDataSource`.
- One request yields one `SpeciesReferenceResponse`.

### BirdSpeciesRecord

**Purpose**: Represents one normalized bird observation row returned to the
analysis page.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | integer | Row sequence number shown on the card |
| `speciesName` | string | Bird species name |
| `residencyType` | string | 居留类型 |
| `protectionLevel` | string | 保护级别 |
| `ecologicalTraits` | string | 生态特征 detail line for the modal |
| `observationDifficulty` | string | 观测难度 detail line for the modal |

**Validation rules**:

- `sequence` must be a positive integer.
- `speciesName` must be non-empty after trimming.
- Missing `ecologicalTraits` must normalize to `暂无生态特征信息`.
- Missing `observationDifficulty` must normalize to `暂无观测难度信息`.

**Relationships**:

- Many `BirdSpeciesRecord` rows belong to one `ParkSpeciesDataSource`.
- Many `BirdSpeciesRecord` rows can be included in one `SpeciesReferenceCollection`.

### SpeciesReferenceCollection

**Purpose**: Represents the normalized list payload for either preview or full
display.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `view` | enum | `preview` or `full` |
| `totalCount` | integer | Total number of valid rows found in the JSON source |
| `returnedCount` | integer | Number of rows returned in the current response |
| `hasMore` | boolean | Whether additional rows remain beyond the current response |
| `isComplete` | boolean | Whether the current response already includes all valid rows |
| `records` | array | Ordered `BirdSpeciesRecord` list |

**Validation rules**:

- `returnedCount` must equal `records.length`.
- `preview` mode must cap `returnedCount` at 10.
- `full` mode must set `returnedCount = totalCount`.
- `hasMore` must be `true` only when `totalCount > returnedCount`.
- `isComplete` must be the inverse of `hasMore`.

**Relationships**:

- One collection belongs to one `SpeciesReferenceResponse`.
- One collection contains many `BirdSpeciesRecord` rows.

### SpeciesReferenceResponse

**Purpose**: Represents the full API payload returned to the analysis page.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `requestStatus` | enum | `success`, `empty`, `invalid_park`, or `failed` |
| `message` | string | User-facing status summary |
| `requestedAt` | string | Server processing timestamp |
| `parkId` | string/null | Requested park identifier |
| `parkName` | string/null | Requested park display name |
| `sourceStatus` | enum/null | `available`, `missing`, or `unreadable` when applicable |
| `collection` | object/null | Serialized `SpeciesReferenceCollection` |

**Validation rules**:

- `requestStatus = success` requires non-null `collection` with at least one
  record and `sourceStatus = available`.
- `requestStatus = empty` requires non-null `collection` with zero records and
  `sourceStatus = available`.
- `requestStatus = invalid_park` must not include stale collection data.
- `requestStatus = failed` requires a concrete `sourceStatus` of `missing` or
  `unreadable` and must not include misleading records.

**Relationships**:

- One response belongs to one `SpeciesReferenceRequest`.
- One response may contain one `SpeciesReferenceCollection`.

## Derived State Rules

- Preview mode returns the first 10 valid rows in source order.
- Full mode returns all valid rows in source order.
- JSON source rows lacking required card fields are skipped only if they cannot
  produce a meaningful species record after normalization.
- Park switching invalidates prior preview/full results; the UI must only show
  the latest request’s response.

## State Transitions

### Preview Success

1. Frontend requests `view=preview`.
2. Route resolves the current JSON source and parses the source file.
3. Server normalizes all valid rows, then returns the first 10 or fewer rows.
4. UI renders the preview list and conditionally shows `点击查看全部信息`.

### Full Success

1. Frontend requests `view=full` for the current park.
2. Route resolves and parses the same JSON source.
3. Server returns every valid normalized row in source order.
4. UI replaces preview mode with the complete list and removes the load-more trigger.

### Empty Source

1. JSON source exists and is readable.
2. No valid data rows remain after normalization.
3. API returns `requestStatus = empty`.
4. UI renders a dedicated empty state instead of a blank list.

### Source Failure

1. Source mapping fails, file is missing, or parsing is unreadable.
2. API returns either `invalid_park` or `failed`.
3. UI shows a scoped error state and must not leave stale species cards visible.
