# Data Model: 记录页记事本

## Overview

This feature adds an account-bound notebook that is stored on the server and
rendered inside the `记录` page. The notebook repository is scoped by assistant
account, while the UI works with editable drafts, aggregate statistics, and
login-reminder states.

## Entities

### NotebookOwner

**Purpose**: Identifies the assistant account that owns a notebook document.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `assistantAccount` | string | Logged-in assistant account |
| `storageKey` | string | Filesystem-safe key used by the server repository |

**Validation rules**:

- `assistantAccount` must be non-empty after trimming.
- `storageKey` must be deterministic for the same account and safe for file
  names.

### ObservationCoordinates

**Purpose**: Represents optional coordinates produced by device location or map
point selection.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `longitude` | number | Longitude in decimal degrees |
| `latitude` | number | Latitude in decimal degrees |

**Validation rules**:

- `longitude` must be between `-180` and `180`.
- `latitude` must be between `-90` and `90`.

### ObservationRecord

**Purpose**: Represents one saved notebook entry.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `recordId` | string | Stable unique record identifier |
| `assistantAccount` | string | Owning assistant account |
| `observationDate` | string | Beijing date in `YYYY-MM-DD` format |
| `observationTime` | string | Beijing time in `HH:mm` format |
| `observationDateTimeIso` | string | Server-normalized ISO timestamp for sorting |
| `birdPoint` | string | User-visible birding location text |
| `speciesName` | string | Bird name entered by the user |
| `note` | string | Optional remark text |
| `locationSource` | enum | `manual`, `device`, or `map` |
| `coordinates` | ObservationCoordinates \| null | Optional coordinates for resolved locations |
| `createdAt` | string | Record creation timestamp |
| `updatedAt` | string | Last update timestamp |

**Validation rules**:

- `observationDate` is required and must match `YYYY-MM-DD`.
- `observationTime` is required and must match `HH:mm`.
- `birdPoint` is required after trimming.
- `speciesName` is required after trimming.
- `note` may be empty but must not exceed 100 Chinese characters or 100
  standard code units in the stored payload.
- `coordinates` may only be present when `locationSource` is `device` or `map`.
- Saved records are sorted by `observationDateTimeIso` descending, then by
  `updatedAt` descending when timestamps match.

### NotebookSummary

**Purpose**: Provides the aggregate counts shown at the top of the notebook
panel.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `totalRecordCount` | number | Total saved records for the current account |
| `uniqueSpeciesCount` | number | Count of distinct bird names for the current account |

**Validation rules**:

- Both counts must be zero or positive integers.
- `uniqueSpeciesCount` is derived from trimmed `speciesName` values and must not
  exceed `totalRecordCount`.

### NotebookDocument

**Purpose**: Represents the repository payload stored for one assistant
account.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `assistantAccount` | string | Notebook owner |
| `summary` | NotebookSummary | Cached or derived aggregate counts |
| `records` | ObservationRecord[] | All records owned by the account |
| `updatedAt` | string | Notebook-level last update timestamp |

**Validation rules**:

- Every `records[*].assistantAccount` must equal the document
  `assistantAccount`.
- `summary` must match the current `records` collection whenever the document is
  returned to the client.

### RecordDraft

**Purpose**: Represents the client-side editing state for creating or editing a
record.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `mode` | enum | `create` or `edit` |
| `targetRecordId` | string \| null | Edited record id when `mode = edit` |
| `observationDate` | string | Draft date value |
| `observationTime` | string | Draft time value |
| `birdPoint` | string | Draft bird point text |
| `speciesName` | string | Draft bird name |
| `note` | string | Draft remark text |
| `locationSource` | enum | `manual`, `device`, or `map` |
| `coordinates` | ObservationCoordinates \| null | Draft coordinate payload |
| `isDirty` | boolean | Whether the user changed the draft after opening it |

**Validation rules**:

- New drafts default to the current Beijing date and time when opened.
- Edit drafts are initialized from the saved record.
- `isDirty` becomes `true` after any user-visible mutation.

### ResolvedBirdPoint

**Purpose**: Represents the backend response used to fill the bird point field
from device or map coordinates.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Final Chinese location text written into the form |
| `coordinates` | ObservationCoordinates | The source coordinates |
| `source` | enum | `device` or `map` |
| `usedFallbackLabel` | boolean | Whether the label is a coordinate fallback instead of a resolved address |

**Validation rules**:

- `label` must always be non-empty.
- `usedFallbackLabel = true` is allowed only when a readable address could not
  be resolved.

### NotebookAccessPrompt

**Purpose**: Represents the UI state for notebook-triggered login interception
and follow-up reminders.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `reason` | enum | `create`, `edit`, `delete`, or `view` |
| `stage` | enum | `login`, `account_not_found`, `login_required_reminder`, or `closed` |
| `message` | string | Simplified Chinese message shown in the current dialog state |

**Validation rules**:

- `account_not_found` must show `请先注册助手账号！`.
- `login_required_reminder` must show `请登录个人空间！`.

## State Transitions

### Notebook Fetch

1. `RecordsScreen` receives the current auth snapshot.
2. If authenticated, the client requests `GET /api/records/notebook`.
3. The Route Handler resolves the current assistant account and returns the
   notebook summary plus the sorted record list.

### Create Record

1. User taps `新增记录`.
2. The editor opens with current Beijing date and time.
3. The user fills required fields and submits.
4. The server validates the payload, saves the record, recomputes summary, and
   returns the updated notebook view.

### Edit Record

1. User taps an existing record card.
2. The editor opens with the saved values.
3. The user modifies content and saves.
4. The server validates the update, persists it, recomputes summary, and
   returns the updated notebook view.

### Delete Record

1. User taps the trash icon on a record card.
2. A confirmation dialog asks `确认删除此记录？`.
3. On confirm, the server deletes the record and returns the updated notebook
   summary and list.

### Guest Interception

1. A guest user tries to use a protected notebook action.
2. The current page opens the login dialog instead of navigating away.
3. If login succeeds, the blocked action may continue in the current page
   context.
4. If the account does not exist, the dialog shows `请先注册助手账号！`.
5. If the login dialog closes without success, the page shows the follow-up
   reminder `请登录个人空间！`.
