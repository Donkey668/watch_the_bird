# API Contract: Analysis Birding Outlook

## Route Surface

- **Route**: `GET /api/analysis/birding-outlook`
- **Caller**: Analysis-screen weather and birding outlook panel
- **Purpose**: Return district weather plus same-day birding suitability for
  the currently selected preset park

## Request Contract

### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `parkId` | Yes | string | Preset park identifier selected in the map panel |

### Request Rules

- `parkId` must match one configured preset park.
- The frontend must call this endpoint whenever the default park loads or the
  user selects a different park.
- The frontend must not call AMap Weather API directly.
- The Route Handler must compute birding index locally and must not call an LLM.

## Success Response Contract

### `200 OK` with full success

```json
{
  "requestStatus": "success",
  "message": "天气信息和观鸟指数已更新。",
  "requestedAt": "2026-04-02T02:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "Shenzhen Bay Park",
    "cityName": "Shenzhen",
    "districtName": "南山区",
    "districtCode": "440305"
  },
  "weather": {
    "districtName": "南山区",
    "districtCode": "440305",
    "weatherText": "多云",
    "temperature": "26",
    "humidity": "72",
    "windDirection": "南",
    "windPower": "3",
    "reportTime": "2026-04-02 10:00:00",
    "rawStatus": "success",
    "details": [
      {
        "key": "province",
        "label": "省份",
        "value": "广东省"
      },
      {
        "key": "city",
        "label": "城市",
        "value": "深圳市"
      },
      {
        "key": "district",
        "label": "所在区县",
        "value": "南山区"
      }
    ]
  },
  "birdingIndex": {
    "level": "较适宜",
    "status": "success",
    "generatedAt": "2026-04-02T02:00:00.050Z",
    "modelName": "local-weather-score-v1",
    "rawResult": {
      "weatherKey": "多云",
      "weatherScore": 90,
      "windLevel": 3,
      "windScore": 100,
      "temperature": 26,
      "temperatureScore": 75,
      "humidity": 72,
      "humidityScore": 50,
      "totalScore": 81,
      "weights": {
        "weather": 0.4,
        "wind": 0.2,
        "temperature": 0.2,
        "humidity": 0.2
      }
    }
  }
}
```

### `200 OK` with partial success

```json
{
  "requestStatus": "partial",
  "message": "天气信息已更新，但观鸟指数暂时不可用。",
  "requestedAt": "2026-04-02T02:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "Shenzhen Bay Park",
    "cityName": "Shenzhen",
    "districtName": "南山区",
    "districtCode": "440305"
  },
  "weather": {
    "districtName": "南山区",
    "districtCode": "440305",
    "weatherText": "未知天气",
    "temperature": "26",
    "humidity": "72",
    "windDirection": "南",
    "windPower": "3",
    "reportTime": "2026-04-02 10:00:00",
    "rawStatus": "success",
    "details": []
  },
  "birdingIndex": {
    "level": null,
    "status": "unavailable",
    "generatedAt": null,
    "modelName": "local-weather-score-v1",
    "rawResult": null,
    "failureReason": "当前天气现象“未知天气”暂不支持本地观鸟指数换算。"
  }
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_park",
  "message": "未找到对应的公园参数。",
  "requestedAt": "2026-04-02T02:00:00.000Z"
}
```

### `502 Bad Gateway`

```json
{
  "requestStatus": "failed",
  "message": "天气信息暂时不可用，请稍后重试。",
  "requestedAt": "2026-04-02T02:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "Shenzhen Bay Park",
    "cityName": "Shenzhen",
    "districtName": "南山区",
    "districtCode": "440305"
  }
}
```

## Upstream Integration Rules

- The Route Handler must compose the AMap weather URL with the required `key` query parameter on every request.
- The Route Handler must request and parse JSON from the weather service.
- The weather payload returned to the frontend must include normalized summary fields plus a `details` array for direct rendering.
- Birding index scoring must be local and deterministic.
- A successful score must follow the fixed weighted formula and final-score bands documented in `spec.md`.
- The frontend must treat `requestStatus = partial` as renderable weather data with unavailable birding index, not as a fatal panel error.
