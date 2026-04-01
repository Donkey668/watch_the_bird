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
- The frontend must not call AMap Weather API or the LLM endpoint directly.

## Success Response Contract

### `200 OK` with full success

```json
{
  "requestStatus": "success",
  "message": "\u5929\u6c14\u4fe1\u606f\u548c\u89c2\u9e1f\u6307\u6570\u5df2\u66f4\u65b0\u3002",
  "requestedAt": "2026-03-31T10:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "Shenzhen Bay Park",
    "cityName": "Shenzhen",
    "districtName": "\u5357\u5c71\u533a",
    "districtCode": "440305"
  },
  "weather": {
    "districtName": "\u5357\u5c71\u533a",
    "districtCode": "440305",
    "weatherText": "Cloudy",
    "temperature": "26",
    "humidity": "72",
    "windDirection": "South",
    "windPower": "3",
    "reportTime": "2026-03-31 17:00:00",
    "rawStatus": "success",
    "details": [
      {
        "key": "district",
        "label": "\u6240\u5728\u533a\u53bf",
        "value": "\u5357\u5c71\u533a"
      },
      {
        "key": "weather",
        "label": "\u5929\u6c14",
        "value": "Cloudy"
      }
    ]
  },
  "birdingIndex": {
    "level": "\u8f83\u9002\u5b9c",
    "status": "success",
    "generatedAt": "2026-03-31T10:00:01.200Z",
    "modelName": "qwen3.5-plus"
  }
}
```

### `200 OK` with partial success

```json
{
  "requestStatus": "partial",
  "message": "\u5929\u6c14\u4fe1\u606f\u5df2\u66f4\u65b0\uff0c\u4f46\u89c2\u9e1f\u6307\u6570\u6682\u65f6\u4e0d\u53ef\u7528\u3002",
  "requestedAt": "2026-03-31T10:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "Shenzhen Bay Park",
    "cityName": "Shenzhen",
    "districtName": "\u5357\u5c71\u533a",
    "districtCode": "440305"
  },
  "weather": {
    "districtName": "\u5357\u5c71\u533a",
    "districtCode": "440305",
    "weatherText": "Cloudy",
    "temperature": "26",
    "humidity": "72",
    "windDirection": "South",
    "windPower": "3",
    "reportTime": "2026-03-31 17:00:00",
    "rawStatus": "success",
    "details": [
      {
        "key": "district",
        "label": "\u6240\u5728\u533a\u53bf",
        "value": "\u5357\u5c71\u533a"
      },
      {
        "key": "weather",
        "label": "\u5929\u6c14",
        "value": "Cloudy"
      }
    ]
  },
  "birdingIndex": {
    "level": null,
    "status": "unavailable",
    "generatedAt": null,
    "modelName": "qwen3.5-plus",
    "failureReason": "\u89c2\u9e1f\u6307\u6570\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\u3002"
  }
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_park",
  "message": "\u672a\u627e\u5230\u5bf9\u5e94\u7684\u516c\u56ed\u53c2\u6570\u3002",
  "requestedAt": "2026-03-31T10:00:00.000Z"
}
```

### `502 Bad Gateway`

```json
{
  "requestStatus": "failed",
  "message": "\u5929\u6c14\u4fe1\u606f\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
  "requestedAt": "2026-03-31T10:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "Shenzhen Bay Park",
    "cityName": "Shenzhen",
    "districtName": "\u5357\u5c71\u533a",
    "districtCode": "440305"
  }
}
```

## Upstream Integration Rules

- The Route Handler must compose the AMap weather URL with the required `key`
  query parameter on every request.
- The Route Handler must request and parse JSON from the weather service.
- The weather payload returned to the frontend must include normalized summary
  fields plus a `details` array for direct rendering.
- The LLM call must use `response_format: { type: "json_object" }` and reject
  any non-enum birding index value.
- The frontend must treat `requestStatus = partial` as renderable weather data
  with unavailable birding index, not as a fatal panel error.
