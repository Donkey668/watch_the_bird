# API Contract: Auth Login

## Route Surface

- **Route**: `POST /api/auth/login`
- **Caller**: Shared login dialog rendered in the mobile shell
- **Purpose**: Validate the built-in test credential and return a session-safe
  login result for the current page session

## Request Contract

### Request Body

```json
{
  "assistantAccount": "WTBTEST",
  "userPassword": "123456"
}
```

### Request Rules

- `assistantAccount` is required.
- `userPassword` is required.
- Both fields are treated as exact string matches in the current scope.

## Success Response Contract

### `200 OK`

```json
{
  "requestStatus": "success",
  "message": "登录成功。",
  "assistantAccount": "WTBTEST"
}
```

## Error Response Contract

### `400 Bad Request`

```json
{
  "requestStatus": "invalid_input",
  "message": "请完整填写助手账号和用户密码。",
  "assistantAccount": null
}
```

### `401 Unauthorized`

```json
{
  "requestStatus": "invalid_credentials",
  "message": "助手账号或用户密码错误。",
  "assistantAccount": null
}
```

## Contract Rules

- The Route Handler must not expose the stored password in any response.
- The success payload returns only the assistant account label needed by the UI.
- The frontend may only switch into the authenticated view when
  `requestStatus = success`.
