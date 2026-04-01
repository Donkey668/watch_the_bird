# API Contract: Habitat Species Reference

## Route Surface

- **Route**: `GET /api/analysis/habitat-species-reference`
- **Caller**: Analysis-page habitat species reference component
- **Purpose**: Return preview or full bird species records for the currently
  selected preset park, based on the corresponding workbook in `parkinfo/`

## Request Contract

### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `parkId` | Yes | string | Selected preset park identifier |
| `view` | No | string | `preview` or `full`; defaults to `preview` |

### Request Rules

- The frontend must use `view=preview` for the initial module load.
- The frontend must only request `view=full` after the user explicitly taps
  `点击查看全部信息`.
- The frontend must not read or parse Excel files directly in the browser.
- The endpoint must run in the Next.js server runtime and keep workbook access
  behind the API boundary.

## Success Response Contract

### `200 OK` with preview success

```json
{
  "requestStatus": "success",
  "message": "已加载深圳湾公园的鸟种参考预览。",
  "requestedAt": "2026-04-01T08:40:15.000Z",
  "parkId": "shenzhen-bay-park",
  "parkName": "深圳湾公园",
  "sourceStatus": "available",
  "collection": {
    "view": "preview",
    "totalCount": 32,
    "returnedCount": 10,
    "hasMore": true,
    "isComplete": false,
    "records": [
      {
        "sequence": 1,
        "speciesName": "白鹭",
        "residencyType": "留鸟",
        "protectionLevel": "三有",
        "ecologicalTraits": "湿地常见，通体白色羽毛，嘴黑色，常站立于红树林边缘或浅水区捕食鱼类",
        "observationDifficulty": "极易"
      },
      {
        "sequence": 2,
        "speciesName": "夜鹭",
        "residencyType": "留鸟",
        "protectionLevel": "三有",
        "ecologicalTraits": "昼伏夜出，黄昏时群飞归巢，体羽灰色，头顶黑色，常见于红树林岛和湖边",
        "observationDifficulty": "极易"
      }
    ]
  }
}
```

### `200 OK` with full success

The payload shape is identical to preview success, with these required
differences:

- `collection.view` = `full`
- `collection.returnedCount` = `collection.totalCount`
- `collection.hasMore` = `false`
- `collection.isComplete` = `true`
- `collection.records` contains every valid row from the workbook in source order

### `200 OK` with empty workbook data

```json
{
  "requestStatus": "empty",
  "message": "当前公园暂无可展示的鸟种参考记录。",
  "requestedAt": "2026-04-01T08:40:15.000Z",
  "parkId": "shenzhen-bay-park",
  "parkName": "深圳湾公园",
  "sourceStatus": "available",
  "collection": {
    "view": "preview",
    "totalCount": 0,
    "returnedCount": 0,
    "hasMore": false,
    "isComplete": true,
    "records": []
  }
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_park",
  "message": "未找到对应的公园参数。",
  "requestedAt": "2026-04-01T08:40:15.000Z",
  "parkId": null,
  "parkName": null,
  "sourceStatus": null,
  "collection": null
}
```

### `404 Not Found`

```json
{
  "requestStatus": "failed",
  "message": "当前公园的鸟种参考文件不存在。",
  "requestedAt": "2026-04-01T08:40:15.000Z",
  "parkId": "shenzhen-bay-park",
  "parkName": "深圳湾公园",
  "sourceStatus": "missing",
  "collection": null
}
```

### `500 Internal Server Error`

```json
{
  "requestStatus": "failed",
  "message": "鸟种参考文件暂时无法读取，请稍后重试。",
  "requestedAt": "2026-04-01T08:40:15.000Z",
  "parkId": "shenzhen-bay-park",
  "parkName": "深圳湾公园",
  "sourceStatus": "unreadable",
  "collection": null
}
```

## Contract Rules

- `collection.records` must preserve workbook row order.
- Preview mode must never return more than 10 records.
- Full mode must never truncate valid workbook rows.
- Missing `ecologicalTraits` must normalize to `暂无生态特征信息`.
- Missing `observationDifficulty` must normalize to `暂无观测难度信息`.
- The frontend may render a response only when it belongs to the latest
  selected `parkId` and latest request mode for that selection.
