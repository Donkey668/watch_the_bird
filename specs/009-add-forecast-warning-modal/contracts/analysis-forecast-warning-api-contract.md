# API Contract: Analysis Forecast Warning Modal

## Route Surface

- **Route**: `GET /api/analysis/forecast-warning`
- **Caller**: Analysis weather and birding-outlook panel modal trigger flow
- **Purpose**: Aggregate four Shenzhen Open Data forecast/warning datasets for
  the selected park district and return normalized module-ready data

## Request Contract

### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `parkId` | Yes | string | Preset park identifier selected in map panel |

### Request Rules

- Frontend must call this endpoint only after user opens the forecast-warning modal.
- Frontend must not call Shenzhen Open Data interfaces directly.
- Route Handler must resolve district context from configured `parkId`.
- Route Handler must call upstream datasets with shared
  `appKey = process.env.SZ_WEATHER_APP_KEY`.

## Upstream Integration Contract

### Shared upstream parameters

| Name | Required | Type | Rule |
|------|----------|------|------|
| `appKey` | Yes | string | Must equal `SZ_WEATHER_APP_KEY` |
| `page` | Yes | int | Starts at `1` for modal on-demand fetch |
| `rows` | Yes | int | Bounded per module, always `<= 10000` |
| `startDate` | No | string | `yyyymmdd`, used when time window should be narrowed |
| `endDate` | No | string | `yyyymmdd`, used with `startDate` |

### Upstream endpoints used

| Module | Endpoint |
|--------|----------|
| 分区逐时预报 | `https://opendata.sz.gov.cn/api/339779363/1/service.xhtml` |
| 分区预报 | `https://opendata.sz.gov.cn/api/29200_00903517/1/service.xhtml` |
| 日月时刻 | `https://opendata.sz.gov.cn/api/1214604037/1/service.xhtml` |
| 灾害预警 | `https://opendata.sz.gov.cn/api/589826359/1/service.xhtml` |

### Upstream field coverage

The normalization layer must support at least these fields (as returned by
upstream): `RECID`, `DDATETIME`, `WRITETIME`, `WEATHERSTATUS`, `QPFTEMP`,
`MINTEMPERATURE`, `MAXTEMPERATURE`, `ATTRIBNAME`, `ATTRIBVALUE`, `ISSUETIME`,
`SIGNALTYPE`, `SIGNALLEVEL`, `ISSUECONTENT`, `DISTRICT`, `ISSUESTATE`,
`AREANAME`, plus optional related fields when present.

## Success Response Contract

### `200 OK` with full success

```json
{
  "requestStatus": "success",
  "message": "预报预警信息已更新。",
  "requestedAt": "2026-04-03T12:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "深圳湾公园",
    "districtName": "南山区",
    "districtCode": "440305"
  },
  "hourlyForecast": {
    "status": "success",
    "message": "已加载分区逐时预报。",
    "source": "339779363",
    "returnedCount": 6,
    "records": [
      {
        "recId": "10201",
        "forecastTime": "2026-04-03 21:00:00",
        "weatherStatus": "多云",
        "qpfTemp": "25"
      }
    ]
  },
  "districtForecast": {
    "status": "success",
    "message": "已加载分区预报。",
    "source": "29200_00903517",
    "returnedCount": 3,
    "records": [
      {
        "recId": "5881",
        "forecastTime": "2026-04-04 08:00:00",
        "weatherStatus": "阵雨",
        "minTemperature": "23",
        "maxTemperature": "29"
      }
    ]
  },
  "sunMoonTiming": {
    "status": "success",
    "message": "已加载日月时刻。",
    "source": "1214604037",
    "returnedCount": 2,
    "records": [
      {
        "keyId": "901",
        "forecastTime": "2026-04-03 00:00:00",
        "attribName": "日出",
        "attribValue": "06:16"
      }
    ]
  },
  "disasterWarning": {
    "status": "success",
    "message": "已加载灾害预警。",
    "source": "589826359",
    "returnedCount": 2,
    "records": [
      {
        "sequence": 1,
        "issueTime": "2026-04-03 17:20:00",
        "signalType": "雷雨大风",
        "signalLevel": "黄色",
        "issueContent": "南山区雷雨大风黄色预警生效中。",
        "district": "南山区",
        "textColorToken": "text-yellow-600",
        "isPlaceholder": false
      }
    ]
  }
}
```

### `200 OK` with partial module failure

```json
{
  "requestStatus": "partial",
  "message": "部分预报预警模块暂不可用。",
  "requestedAt": "2026-04-03T12:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "深圳湾公园",
    "districtName": "南山区",
    "districtCode": "440305"
  },
  "hourlyForecast": {
    "status": "failed",
    "message": "分区逐时预报暂时不可用，请稍后重试。",
    "source": "339779363",
    "returnedCount": 0,
    "records": []
  },
  "districtForecast": {
    "status": "success",
    "message": "已加载分区预报。",
    "source": "29200_00903517",
    "returnedCount": 3,
    "records": []
  },
  "sunMoonTiming": {
    "status": "empty",
    "message": "今天暂无可展示的日月时刻数据。",
    "source": "1214604037",
    "returnedCount": 0,
    "records": []
  },
  "disasterWarning": {
    "status": "success",
    "message": "当前无生效信号。",
    "source": "589826359",
    "returnedCount": 1,
    "records": [
      {
        "sequence": 1,
        "signalType": "",
        "signalLevel": "",
        "issueContent": "",
        "district": "",
        "textColorToken": "text-gray-400",
        "isPlaceholder": true
      }
    ]
  }
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_park",
  "message": "未找到对应的公园参数。",
  "requestedAt": "2026-04-03T12:00:00.000Z",
  "park": null
}
```

### `502 Bad Gateway`

```json
{
  "requestStatus": "failed",
  "message": "预报预警服务暂时不可用，请稍后重试。",
  "requestedAt": "2026-04-03T12:00:00.000Z",
  "park": {
    "parkId": "shenzhen-bay-park",
    "parkName": "深圳湾公园",
    "districtName": "南山区",
    "districtCode": "440305"
  }
}
```

## Contract Rules

- Route Handler must keep `SZ_WEATHER_APP_KEY` server-only.
- Each upstream call must include `appKey/page/rows`; `rows` must stay
  `<= 10000`.
- Time-window query parameters (`startDate/endDate`) should be used where they
  reduce dataset size without losing required records.
- Module filtering by district and time must happen server-side before response.
- Warning detail fields `ISSUECONTENT` and `DISTRICT` must be preserved for
  detail-dialog rendering.
- Frontend must treat `requestStatus = partial` as renderable state and render
  per-module status independently.
