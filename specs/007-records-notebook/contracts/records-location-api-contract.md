# API Contract: Records Location Resolve

## Route Surface

- **Route**: `GET /api/records/location/resolve`
- **Primary callers**: 记录编辑弹窗中的定位图标、地图选点弹窗
- **Purpose**: Convert client-selected coordinates into the Chinese bird point
  text written back into the notebook form

## Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `longitude` | Yes | number-like string | Selected longitude |
| `latitude` | Yes | number-like string | Selected latitude |
| `source` | Yes | string | `device` or `map` |

## Request Rules

- The frontend is responsible for obtaining coordinates from the browser
  geolocation API or the AMap picker UI.
- The frontend must not call third-party reverse-geocoding services directly.
- The Route Handler must normalize the final label before returning it to the
  client.
- The endpoint should prefer a readable Chinese address, but may fall back to a
  coordinate label when reverse geocoding is unavailable.

## Success Response Contract

### `200 OK`

```json
{
  "requestStatus": "success",
  "message": "已解析鸟点位置。",
  "requestedAt": "2026-04-01T02:00:00.000Z",
  "location": {
    "label": "广东省深圳市南山区深圳湾公园观鸟平台附近",
    "coordinates": {
      "longitude": 113.9462,
      "latitude": 22.5221
    },
    "source": "map",
    "usedFallbackLabel": false
  }
}
```

### `200 OK` with fallback label

```json
{
  "requestStatus": "success",
  "message": "已解析鸟点位置。",
  "requestedAt": "2026-04-01T02:00:00.000Z",
  "location": {
    "label": "经度 113.946200，纬度 22.522100",
    "coordinates": {
      "longitude": 113.9462,
      "latitude": 22.5221
    },
    "source": "device",
    "usedFallbackLabel": true
  }
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_input",
  "message": "定位参数无效，请重新选择位置。",
  "requestedAt": "2026-04-01T02:00:00.000Z",
  "location": null
}
```

### `500 Internal Server Error`

```json
{
  "requestStatus": "failed",
  "message": "位置解析失败，请稍后重试。",
  "requestedAt": "2026-04-01T02:00:00.000Z",
  "location": null
}
```

## Contract Rules

- The endpoint must return Simplified Chinese messages.
- The endpoint must never return an empty `label` when the request succeeds.
- `usedFallbackLabel = true` must remain explicit so the UI can decide whether
  to show a lightweight hint.
- The UI must preserve the current draft if the endpoint returns any failure.
