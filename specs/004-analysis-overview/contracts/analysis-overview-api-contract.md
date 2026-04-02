# API Contract: Analysis Overview

## Route Surface

- **Route**: `GET /api/analysis/birding-outlook`
- **Caller**: Analysis-screen weather and overview surfaces
- **Purpose**: Return district weather, birding index, and one render-ready
  Beijing-time analysis overview for the currently selected preset park

## Request Contract

### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `parkId` | Yes | string | Preset park identifier selected in the map panel |

### Request Rules

- The frontend continues to make exactly one request per selected `parkId`.
- The frontend must not derive Beijing time from browser-local timezone for the
  overview; it must trust the server response.
- The frontend must not request a separate overview endpoint.

## Success Response Contract

### `200 OK` with full success

```json
{
  "requestStatus": "success",
  "message": "天气信息和观鸟指数已更新。",
  "requestedAt": "2026-04-01T01:30:01.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "深圳湾公园",
    "cityName": "深圳",
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
    "reportTime": "2026-04-01 09:25:00",
    "rawStatus": "success",
    "details": [
      {
        "key": "district",
        "label": "所在区县",
        "value": "南山区"
      },
      {
        "key": "weather",
        "label": "天气",
        "value": "多云"
      }
    ]
  },
  "birdingIndex": {
    "level": "适宜",
    "status": "success",
    "generatedAt": "2026-04-01T01:30:01.120Z",
    "modelName": "local-weather-score-v1"
  },
  "analysisOverview": {
    "title": "栖息地环境指标",
    "beijingTime": {
      "displayText": "2026年4月1日 09:30",
      "isoTimestamp": "2026-04-01T09:30:00+08:00"
    },
    "habitatActivity": {
      "label": "栖息地活跃度",
      "value": "较高",
      "status": "success"
    },
    "migrationSignal": {
      "label": "迁徙信号",
      "value": "中等"
    },
    "observationConfidence": {
      "label": "观测可信度",
      "value": "稳定"
    }
  }
}
```

### `200 OK` with partial success

```json
{
  "requestStatus": "partial",
  "message": "天气信息已更新，但观鸟指数暂时不可用。",
  "requestedAt": "2026-04-01T01:30:01.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "深圳湾公园",
    "cityName": "深圳",
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
    "reportTime": "2026-04-01 09:25:00",
    "rawStatus": "success",
    "details": []
  },
  "birdingIndex": {
    "level": null,
    "status": "unavailable",
    "generatedAt": null,
    "modelName": "local-weather-score-v1",
    "failureReason": "观鸟指数服务暂时不可用。"
  },
  "analysisOverview": {
    "title": "栖息地环境指标",
    "beijingTime": {
      "displayText": "2026年4月1日 09:30",
      "isoTimestamp": "2026-04-01T09:30:00+08:00"
    },
    "habitatActivity": {
      "label": "栖息地活跃度",
      "value": "暂不可用",
      "status": "unavailable"
    },
    "migrationSignal": {
      "label": "迁徙信号",
      "value": "中等"
    },
    "observationConfidence": {
      "label": "观测可信度",
      "value": "稳定"
    }
  }
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_park",
  "message": "未找到对应的公园参数。",
  "requestedAt": "2026-04-01T01:30:01.000Z",
  "analysisOverview": null
}
```

### `502 Bad Gateway`

```json
{
  "requestStatus": "failed",
  "message": "天气信息暂时不可用，请稍后重试。",
  "requestedAt": "2026-04-01T01:30:01.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "深圳湾公园",
    "cityName": "深圳",
    "districtName": "南山区",
    "districtCode": "440305"
  },
  "weather": null,
  "birdingIndex": null,
  "analysisOverview": null
}
```

## Contract Rules

- `analysisOverview.title` must always be `栖息地环境指标`.
- `analysisOverview.beijingTime.displayText` must always be in the format
  `YYYY年M月D日 HH:mm`.
- The contract must not include a separate current time-slot label intended for
  direct UI rendering.
- On partial success, `analysisOverview.habitatActivity.value` must be
  `暂不可用`.
- The frontend may render `analysisOverview` only when it belongs to the latest
  selected `parkId`.
