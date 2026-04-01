# Data Model: Analysis Park Map Selector

## Overview

This feature is frontend-only and introduces no persisted backend entities. The
data model is a UI state model for preset park selection and map view updates.

## Entities

### ParkOption

**Purpose**: Represents one selectable municipal park in the map dropdown.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | enum | Stable identifier for a preset park |
| `name` | string | Display label shown in dropdown and marker context |
| `longitude` | number | Geographic longitude used for map centering |
| `latitude` | number | Geographic latitude used for map centering |
| `city` | string | City label for map context and future filtering |
| `isDefault` | boolean | Whether this option is selected on initial load |

**Validation rules**:

- Exactly four `ParkOption` entries must exist in this release.
- `id` values must be unique and stable across sessions.
- Longitude and latitude must be valid coordinate values.
- Exactly one option must be marked as default.

**Relationships**:

- One `ParkOption` maps to one active map marker position when selected.

### ParkSelectionState

**Purpose**: Tracks dropdown selection and interaction stability.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `selectedParkId` | enum | Currently active park identifier |
| `lastCommittedParkId` | enum | Last park successfully reflected in map view |
| `isSwitching` | boolean | Whether map selection update is in progress |
| `selectionError` | string/null | Human-readable message when update fails |

**Validation rules**:

- `selectedParkId` must always match one `ParkOption.id`.
- After successful update, `selectedParkId` must equal `lastCommittedParkId`.
- `selectionError` must be null during normal operation.

**Relationships**:

- `ParkSelectionState.selectedParkId` points to one `ParkOption`.
- `ParkSelectionState` drives `MapViewState` updates.

### MapViewState

**Purpose**: Represents map runtime status for rendering and fallback behavior.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `centerLongitude` | number | Current rendered map center longitude |
| `centerLatitude` | number | Current rendered map center latitude |
| `markerLongitude` | number | Current marker longitude |
| `markerLatitude` | number | Current marker latitude |
| `isMapReady` | boolean | Whether map instance finished initialization |
| `isMapAvailable` | boolean | Whether map can render and respond |
| `errorMessage` | string/null | User-facing message for unavailable map state |

**Validation rules**:

- Marker coordinates must match selected park coordinates after each successful
  selection update.
- Only one active marker is allowed at a time.
- `errorMessage` must be present when `isMapAvailable` is false.

**Relationships**:

- `MapViewState` is derived from `ParkSelectionState` and active `ParkOption`.

## Derived State Rules

- Dropdown selected value and active marker location must always stay aligned.
- Rapid multi-selection must settle to the last selected park.
- Map fallback messaging may appear while keeping dropdown interaction available.

## State Transitions

### Initial Load

1. Load map container below fixed top bar.
2. Resolve default `ParkOption`.
3. Initialize map center and marker from default option.
4. Mark `isMapReady = true` once map initialization completes.

### Park Switch

1. User selects another `ParkOption`.
2. `selectedParkId` updates immediately.
3. Map center and marker move to selected park coordinates.
4. `lastCommittedParkId` updates once map reflects the selection.

### Map Unavailable

1. Map initialization or tile loading fails.
2. `isMapAvailable` becomes false and `errorMessage` is shown.
3. Dropdown remains visible for retry/continued selection intent.
4. Once map recovers, state returns to available and synced selection.
