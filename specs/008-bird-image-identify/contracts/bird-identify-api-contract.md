# API Contract: Bird Image Identify

## Route Surface

- **Route**: `POST /api/identify/bird-recognition`
- **Caller**: Identify screen upload flow
- **Purpose**: Accept one uploaded image and return normalized bird recognition
  data plus encyclopedia content for the latest identify-page request

## Request Contract

### Request Body

`multipart/form-data`

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `image` | Yes | file | One local image selected on the identify page |

### Request Rules

- Exactly one `image` file is allowed.
- The frontend must treat each upload as a new recognition context.
- The frontend must not call DashScope or the OpenAI SDK directly.
- The Route Handler must perform all model calls server-side.

## Success Response Contract

### `200 OK` with full success

```json
{
  "requestStatus": "success",
  "message": "鸟类识别结果已更新。",
  "requestedAt": "2026-04-02T10:30:00.000Z",
  "recognition": {
    "status": "success",
    "speciesNameZh": "白鹭",
    "speciesNameEn": "Little Egret",
    "speciesNameLa": "Egretta garzetta",
    "message": "已识别到可参考的鸟种信息。",
    "modelName": "qwen3.6-plus"
  },
  "encyclopedia": {
    "status": "success",
    "message": "鸟类百科简介已生成。",
    "modelName": "qwen3.6-plus",
    "sections": [
      {
        "key": "traits",
        "label": "物种特征",
        "content": "体型修长，通体以白色羽毛为主，嘴细长。"
      },
      {
        "key": "habits",
        "label": "生活习性",
        "content": "常在浅水区域缓慢行走觅食，以小鱼和无脊椎动物为食。"
      },
      {
        "key": "distribution",
        "label": "分布区域",
        "content": "广泛分布于中国南方湿地、河口、湖泊和海湾地带。"
      },
      {
        "key": "protection",
        "label": "保护级别",
        "content": "国内保护：有重要生态、科学、社会价值的陆生野生动物；世界濒危等级：无危。"
      }
    ]
  }
}
```

### `200 OK` with partial success

```json
{
  "requestStatus": "partial",
  "message": "鸟类已识别，但百科简介暂时不可用。",
  "requestedAt": "2026-04-02T10:30:00.000Z",
  "recognition": {
    "status": "success",
    "speciesNameZh": "白鹭",
    "speciesNameEn": "Little Egret",
    "speciesNameLa": "Egretta garzetta",
    "message": "已识别到可参考的鸟种信息。",
    "modelName": "qwen3.6-plus"
  },
  "encyclopedia": {
    "status": "unavailable",
    "message": "鸟类百科简介暂时不可用。",
    "modelName": "qwen3.6-plus",
    "sections": []
  }
}
```

### `200 OK` with no recognizable bird

```json
{
  "requestStatus": "unrecognized",
  "message": "图片中未包含可识别的鸟类！",
  "requestedAt": "2026-04-02T10:30:00.000Z",
  "recognition": {
    "status": "unrecognized",
    "speciesNameZh": null,
    "speciesNameEn": null,
    "speciesNameLa": null,
    "message": "图片中未包含可识别的鸟类！",
    "modelName": "qwen3.6-plus"
  },
  "encyclopedia": null
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_image",
  "message": "请上传有效的图片文件。",
  "requestedAt": "2026-04-02T10:30:00.000Z",
  "recognition": null,
  "encyclopedia": null
}
```

### `502 Bad Gateway`

```json
{
  "requestStatus": "failed",
  "message": "鸟类识别服务暂时不可用，请稍后重试。",
  "requestedAt": "2026-04-02T10:30:00.000Z",
  "recognition": null,
  "encyclopedia": null
}
```

## Contract Rules

- The Route Handler must use the DashScope-compatible OpenAI SDK on the server.
- The Route Handler must normalize all no-bird outcomes to the exact message
  `图片中未包含可识别的鸟类！`.
- The Route Handler must not expose raw credentials or raw upstream model
  payloads to the frontend.
- The frontend may render encyclopedia content only from the normalized
  `sections` array returned by the API.
- The frontend must treat `requestStatus = partial` and
  `requestStatus = unrecognized` as renderable states, not as fatal transport
  errors.
