# Quickstart: 登录/注册入口与弹窗

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing mobile shell and three tab screens already render successfully

## Run The App

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and enable mobile emulation.

## Recommended Viewports

- 375 x 812
- 390 x 844
- 412 x 915
- 430 x 932

## Manual Validation Flow

1. Open `/` and keep portrait mode enabled.
2. Confirm the fixed top navigation still renders at the top.
3. Confirm a `登录` / `注册` entry appears below the nav and aligns to the
   right side.
4. Tap `登录` and confirm the login dialog opens above all page chrome.
5. Confirm the login dialog contains `助手账号` and `用户密码` inputs.
6. Submit with one or both fields empty and confirm a Chinese validation
   message appears.
7. Submit `WTBTEST / 123456` and confirm the dialog closes and the auth entry
   updates to the logged-in state.
8. Reopen the app in the same page session and switch between `分析`、`识别`、
   `记录`; confirm the logged-in state remains visible.
9. Refresh the page and confirm the feature may return to the guest state.
10. Tap `注册` and confirm a registration guidance dialog opens with a default
    administrator avatar and the message `请联系管理员注册与登录`.
11. Confirm no registration form or registration submit flow is present.
12. Confirm the entry and dialogs do not introduce horizontal overflow.

## Validation Record

- 2026-04-01: `npm run lint` passed.
- 2026-04-01: `npx tsc --noEmit` passed.
- 2026-04-01: `npm run build` passed.
- 2026-04-01: `POST /api/auth/login` smoke validation passed for success, empty-field, and invalid-credential responses.
- 2026-04-01: Manual UI validation passed for auth entry placement, login success/failure feedback, registration guidance dialog, session continuity across `分析 / 识别 / 记录`, and refresh reset behavior.

## Implementation Notes

- Keep login validation behind `POST /api/auth/login`.
- Keep registration as a static guidance dialog in the current scope.
- Keep the built-in test credential server-side and avoid storing the password
  in any UI-facing state.
- Keep chart scope as `N/A`.
