# API Contract: Records Notebook

## Route Surface

- **Route group**: `app/api/records/notebook/**`
- **Primary callers**: `记录` 页面中的记事本面板、记录编辑弹窗、删除确认弹窗
- **Purpose**: Return, create, update, and delete the current assistant
  account’s notebook records through App Router Route Handlers only

## Shared Response Rules

- All notebook endpoints require a valid `wtb_auth_session` cookie.
- All notebook endpoints must return `Content-Language: zh-CN` and
  `Cache-Control: no-store`.
- All success responses must include the latest notebook summary and the latest
  record ordering for the current account.
- All user-facing messages must be Simplified Chinese.

## `GET /api/records/notebook`

### Purpose

Load the current account’s notebook summary and sorted record list when the
records page becomes active or when a successful auth transition occurs.

### Success Response

#### `200 OK` with records

```json
{
  "requestStatus": "success",
  "message": "已加载个人观测记录。",
  "requestedAt": "2026-04-01T01:30:00.000Z",
  "assistantAccount": "WTBTEST",
  "notebook": {
    "summary": {
      "totalRecordCount": 2,
      "uniqueSpeciesCount": 2
    },
    "records": [
      {
        "recordId": "rec_001",
        "observationDate": "2026-04-01",
        "observationTime": "09:30",
        "observationDateTimeIso": "2026-04-01T01:30:00.000Z",
        "birdPoint": "深圳湾公园观鸟平台",
        "speciesName": "白鹭",
        "note": "晨间潮位较低，近岸活动明显。",
        "locationSource": "manual",
        "coordinates": null,
        "createdAt": "2026-04-01T01:30:10.000Z",
        "updatedAt": "2026-04-01T01:30:10.000Z"
      }
    ]
  }
}
```

#### `200 OK` with empty notebook

```json
{
  "requestStatus": "empty",
  "message": "当前还没有个人观测记录。",
  "requestedAt": "2026-04-01T01:30:00.000Z",
  "assistantAccount": "WTBTEST",
  "notebook": {
    "summary": {
      "totalRecordCount": 0,
      "uniqueSpeciesCount": 0
    },
    "records": []
  }
}
```

### Error Response

#### `401 Unauthorized`

```json
{
  "requestStatus": "auth_required",
  "message": "请登录个人空间！",
  "requestedAt": "2026-04-01T01:30:00.000Z",
  "assistantAccount": null,
  "notebook": null
}
```

#### `500 Internal Server Error`

```json
{
  "requestStatus": "failed",
  "message": "个人观测记录暂时不可用，请稍后重试。",
  "requestedAt": "2026-04-01T01:30:00.000Z",
  "assistantAccount": "WTBTEST",
  "notebook": null
}
```

## `POST /api/records/notebook`

### Purpose

Create a new record for the current assistant account.

### Request Body

```json
{
  "observationDate": "2026-04-01",
  "observationTime": "09:30",
  "birdPoint": "深圳湾公园观鸟平台",
  "speciesName": "白鹭",
  "note": "晨间潮位较低，近岸活动明显。",
  "locationSource": "manual",
  "coordinates": null
}
```

### Request Rules

- `observationDate` is required and formatted as `YYYY-MM-DD`.
- `observationTime` is required and formatted as `HH:mm`.
- `birdPoint` is required after trimming.
- `speciesName` is required after trimming.
- `note` may be empty but must not exceed 100 characters in the stored payload.
- `locationSource` must be one of `manual`, `device`, `map`.
- `coordinates` is optional and must be present only when the location source is
  `device` or `map`.

### Success Response

#### `201 Created`

```json
{
  "requestStatus": "success",
  "message": "已添加观测记录。",
  "requestedAt": "2026-04-01T01:35:00.000Z",
  "assistantAccount": "WTBTEST",
  "record": {
    "recordId": "rec_002",
    "observationDate": "2026-04-01",
    "observationTime": "09:30",
    "observationDateTimeIso": "2026-04-01T01:30:00.000Z",
    "birdPoint": "深圳湾公园观鸟平台",
    "speciesName": "白鹭",
    "note": "晨间潮位较低，近岸活动明显。",
    "locationSource": "manual",
    "coordinates": null,
    "createdAt": "2026-04-01T01:35:00.000Z",
    "updatedAt": "2026-04-01T01:35:00.000Z"
  },
  "notebook": {
    "summary": {
      "totalRecordCount": 1,
      "uniqueSpeciesCount": 1
    },
    "records": [
      {
        "recordId": "rec_002",
        "observationDate": "2026-04-01",
        "observationTime": "09:30",
        "observationDateTimeIso": "2026-04-01T01:30:00.000Z",
        "birdPoint": "深圳湾公园观鸟平台",
        "speciesName": "白鹭",
        "note": "晨间潮位较低，近岸活动明显。",
        "locationSource": "manual",
        "coordinates": null,
        "createdAt": "2026-04-01T01:35:00.000Z",
        "updatedAt": "2026-04-01T01:35:00.000Z"
      }
    ]
  }
}
```

### Error Responses

#### `400 Bad Request`

```json
{
  "requestStatus": "invalid_input",
  "message": "请完整填写日期、时间、鸟名和鸟点信息。",
  "requestedAt": "2026-04-01T01:35:00.000Z",
  "assistantAccount": "WTBTEST",
  "fieldErrors": {
    "speciesName": "请填写鸟名。"
  }
}
```

#### `401 Unauthorized`

Same payload shape as `GET /api/records/notebook` auth failure.

#### `500 Internal Server Error`

```json
{
  "requestStatus": "failed",
  "message": "保存观测记录失败，请稍后重试。",
  "requestedAt": "2026-04-01T01:35:00.000Z",
  "assistantAccount": "WTBTEST"
}
```

## `PATCH /api/records/notebook/[recordId]`

### Purpose

Update one existing record owned by the current assistant account.

### Path Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `recordId` | Yes | string | Target record identifier |

### Request Body

The body shape matches `POST /api/records/notebook`.

### Success Response

#### `200 OK`

```json
{
  "requestStatus": "success",
  "message": "已更新观测记录。",
  "requestedAt": "2026-04-01T01:40:00.000Z",
  "assistantAccount": "WTBTEST",
  "record": {
    "recordId": "rec_001",
    "observationDate": "2026-04-01",
    "observationTime": "10:00",
    "observationDateTimeIso": "2026-04-01T02:00:00.000Z",
    "birdPoint": "深圳湾公园海边步道",
    "speciesName": "白鹭",
    "note": "改为二次复核后的记录。",
    "locationSource": "map",
    "coordinates": {
      "longitude": 113.9462,
      "latitude": 22.5221
    },
    "createdAt": "2026-04-01T01:30:10.000Z",
    "updatedAt": "2026-04-01T01:40:00.000Z"
  },
  "notebook": {
    "summary": {
      "totalRecordCount": 1,
      "uniqueSpeciesCount": 1
    },
    "records": [
      {
        "recordId": "rec_001",
        "observationDate": "2026-04-01",
        "observationTime": "10:00",
        "observationDateTimeIso": "2026-04-01T02:00:00.000Z",
        "birdPoint": "深圳湾公园海边步道",
        "speciesName": "白鹭",
        "note": "改为二次复核后的记录。",
        "locationSource": "map",
        "coordinates": {
          "longitude": 113.9462,
          "latitude": 22.5221
        },
        "createdAt": "2026-04-01T01:30:10.000Z",
        "updatedAt": "2026-04-01T01:40:00.000Z"
      }
    ]
  }
}
```

### Error Responses

#### `400 Bad Request`

Same validation shape as `POST /api/records/notebook`.

#### `401 Unauthorized`

Same payload shape as `GET /api/records/notebook` auth failure.

#### `404 Not Found`

```json
{
  "requestStatus": "not_found",
  "message": "未找到要更新的记录。",
  "requestedAt": "2026-04-01T01:40:00.000Z",
  "assistantAccount": "WTBTEST"
}
```

#### `500 Internal Server Error`

```json
{
  "requestStatus": "failed",
  "message": "更新观测记录失败，请稍后重试。",
  "requestedAt": "2026-04-01T01:40:00.000Z",
  "assistantAccount": "WTBTEST"
}
```

## `DELETE /api/records/notebook/[recordId]`

### Purpose

Delete one existing record owned by the current assistant account after user
confirmation in the UI.

### Path Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `recordId` | Yes | string | Target record identifier |

### Success Response

#### `200 OK`

```json
{
  "requestStatus": "success",
  "message": "已删除观测记录。",
  "requestedAt": "2026-04-01T01:45:00.000Z",
  "assistantAccount": "WTBTEST",
  "deletedRecordId": "rec_001",
  "notebook": {
    "summary": {
      "totalRecordCount": 0,
      "uniqueSpeciesCount": 0
    },
    "records": []
  }
}
```

### Error Responses

#### `401 Unauthorized`

Same payload shape as `GET /api/records/notebook` auth failure.

#### `404 Not Found`

```json
{
  "requestStatus": "not_found",
  "message": "未找到要删除的记录。",
  "requestedAt": "2026-04-01T01:45:00.000Z",
  "assistantAccount": "WTBTEST"
}
```

#### `500 Internal Server Error`

```json
{
  "requestStatus": "failed",
  "message": "删除观测记录失败，请稍后重试。",
  "requestedAt": "2026-04-01T01:45:00.000Z",
  "assistantAccount": "WTBTEST"
}
```

## Contract Rules

- The frontend must never read or write notebook files directly.
- The Route Handlers must always scope data access to the authenticated
  assistant account.
- The server must not return records belonging to any other account.
- The frontend may optimistically render local pending state, but server
  responses remain the source of truth for summary counts and saved records.
- Chart scope for this feature is `N/A`.
