# Data Model: 登录/注册入口与弹窗

## Overview

This feature introduces no database persistence. It defines a single built-in
test credential, a session-scoped login state for the current browser tab, and
static registration guidance content rendered through shared dialogs.

## Entities

### LoginCredential

**Purpose**: Represents the credential payload sent from the login dialog to the
login Route Handler.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `assistantAccount` | string | User-entered assistant account |
| `userPassword` | string | User-entered password |

**Validation rules**:

- Both fields must be present after trimming.
- `assistantAccount` comparison is exact and case-sensitive for the test account.
- `userPassword` comparison is exact.

### TestAccount

**Purpose**: Represents the built-in account used to verify the login flow.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `assistantAccount` | string | Fixed assistant account identifier |
| `userPassword` | string | Fixed password |
| `displayName` | string | User-facing account label after login |

**Validation rules**:

- The account is server-only and must not be treated as a client-side source of
  truth.
- The configured value for this feature is `WTBTEST / 123456`.

### AuthSessionSnapshot

**Purpose**: Represents the current UI-facing auth state for the active page
session.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `guest` or `authenticated` |
| `assistantAccount` | string/null | Current assistant account label when authenticated |
| `authenticatedAt` | string/null | Client-side timestamp of the successful login |

**Validation rules**:

- `guest` status must not expose stale assistant account data.
- `authenticated` status requires a non-empty assistant account label.
- The snapshot may reset on page refresh in the current feature scope.

### RegistrationNotice

**Purpose**: Represents the static content shown in the registration dialog.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `avatarAssetPath` | string | Repo-local path to the default administrator avatar |
| `message` | string | Registration guidance text |

**Validation rules**:

- `message` must equal `请联系管理员注册与登录` in the current scope.
- `avatarAssetPath` must point to a renderable local image asset.

### LoginResponse

**Purpose**: Represents the API payload returned by the login Route Handler.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `requestStatus` | enum | `success`, `invalid_input`, or `invalid_credentials` |
| `message` | string | User-facing status message |
| `assistantAccount` | string/null | Assistant account label to show on success |

**Validation rules**:

- `success` requires a non-null `assistantAccount`.
- `invalid_input` indicates one or more missing fields.
- `invalid_credentials` indicates a failed account/password match.

## State Transitions

### Guest To Authenticated

1. User opens the login dialog.
2. User submits a non-empty credential pair.
3. Route Handler validates against the built-in test account.
4. UI stores an authenticated session snapshot and updates the auth entry.

### Guest To Registration Guidance

1. User opens the registration dialog.
2. UI renders the default administrator avatar and guidance message.
3. User closes the dialog without any backend mutation.

### Authenticated To Guest

1. User refreshes the page or reopens the site.
2. The current feature scope does not restore persisted auth state.
3. UI returns to the guest auth entry state.
