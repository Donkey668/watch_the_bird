# Data Model: 识别页鸟影识别

## Overview

This feature introduces no persistent database schema. It defines one transient
image-upload request, one normalized bird recognition result, one normalized
encyclopedia summary, and one API response model that preserves latest-upload
state on the identify screen.

## Entities

### UploadedBirdImage

**Purpose**: Represents the single image currently selected by the user on the
identify screen.

| Field | Type | Description |
|-------|------|-------------|
| `fileName` | string | Original client file name |
| `mimeType` | string | Browser-reported file type |
| `byteSize` | number | File size in bytes |
| `previewUrl` | string | Client-local preview URL used only in the active page session |

**Validation rules**:

- Exactly one image file is allowed per request.
- `mimeType` must represent a supported image type.
- Empty files and unreadable files are invalid.
- A new upload replaces the previous `UploadedBirdImage` context immediately.

### BirdRecognitionResult

**Purpose**: Represents the normalized recognition output returned for the
current image.

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `success`, `unrecognized`, or `failed` |
| `speciesNameZh` | string/null | Simplified Chinese species name |
| `speciesNameEn` | string/null | English species name |
| `speciesNameLa` | string/null | Latin species name |
| `message` | string | User-facing status text |
| `modelName` | string | LLM identifier used for recognition |

**Validation rules**:

- `success` requires all three species-name fields to be non-empty.
- `unrecognized` must use the exact message `图片中未包含可识别的鸟类！`.
- `failed` must not expose stale species-name content from a previous upload.

### EncyclopediaSection

**Purpose**: Represents one directly renderable block in the bird encyclopedia
summary.

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Stable section identifier |
| `label` | string | Simplified Chinese section label |
| `content` | string | Cleaned display text |

**Validation rules**:

- Allowed labels in the current scope are `物种特征`, `生活习性`, `分布区域`,
  and `保护级别`.
- `content` must be non-empty for every returned section.
- `保护级别` content must not expose parenthetical fragments.

### BirdEncyclopediaSummary

**Purpose**: Represents the encyclopedia result paired with a successful
recognition output.

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `success` or `unavailable` |
| `sections` | array | Ordered list of directly renderable `EncyclopediaSection` items |
| `message` | string | User-facing status text for success or fallback |
| `modelName` | string | LLM identifier used for encyclopedia generation |

**Validation rules**:

- `success` requires at least four sections in the current scope.
- `unavailable` must preserve the already successful recognition result.
- Section order should remain stable across renders.

### BirdIdentifyResponse

**Purpose**: Represents the Route Handler payload returned to the identify page.

| Field | Type | Description |
|-------|------|-------------|
| `requestStatus` | enum | `success`, `partial`, `invalid_image`, `unrecognized`, or `failed` |
| `message` | string | User-facing top-level summary |
| `requestedAt` | string | Request timestamp |
| `recognition` | object/null | Serialized `BirdRecognitionResult` |
| `encyclopedia` | object/null | Serialized `BirdEncyclopediaSummary` |

**Validation rules**:

- `success` requires `recognition.status = success` and `encyclopedia.status = success`.
- `partial` requires `recognition.status = success` and `encyclopedia.status = unavailable`.
- `unrecognized` requires `recognition.status = unrecognized` and `encyclopedia = null`.
- `invalid_image` indicates file-validation failure before model execution.
- `failed` indicates upstream or internal failure and must not expose stale data.

## State Transitions

### Empty To Previewing

1. User opens the identify page.
2. User selects one local image.
3. The client creates a preview and replaces any previous upload context.

### Previewing To Recognizing

1. The client sends the selected image to the Route Handler.
2. The identify page shows `识别中......`.
3. The previous result context is treated as stale.

### Recognizing To Success

1. The recognition stage returns a normalized bird identity.
2. The encyclopedia stage returns normalized sections.
3. The identify page renders all returned sections for the latest upload only.

### Recognizing To Partial

1. The recognition stage succeeds.
2. The encyclopedia stage fails or becomes unavailable.
3. The identify page keeps bird-name results visible and shows encyclopedia
   fallback messaging only in the encyclopedia area.

### Recognizing To Unrecognized

1. The image request is valid.
2. The recognition stage determines no recognizable bird is present.
3. The Route Handler returns the fixed message
   `图片中未包含可识别的鸟类！`.
4. The identify page keeps the latest preview and allows immediate retry.

### Any Prior Result To New Upload

1. User selects a different image before or after the prior request finishes.
2. The previous result becomes stale.
3. Only the newest upload may update the visible recognition and encyclopedia
   areas.
