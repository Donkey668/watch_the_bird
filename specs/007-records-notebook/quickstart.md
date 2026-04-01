# Quickstart: 记录页记事本

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing project dependencies installed
- Existing auth session flow available
- AMap runtime environment variables already configured if you want to test
  map-based point selection in the browser

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

1. Open `/` in portrait mode and switch to the `记录` tab.
2. Confirm the existing `个人空间 / 个人观测记录` title block still appears.
3. Confirm a notebook panel appears below the title block with
   `X 条记录 / Y 个鸟种` and a separator.
4. While logged out, tap `新增记录` and confirm the page opens the login dialog
   in place instead of navigating away.
5. Submit a nonexistent assistant account and confirm the dialog shows
   `请先注册助手账号！`.
6. Close the notebook-triggered login flow without a successful login and
   confirm the follow-up reminder `请登录个人空间！` appears with a close action.
7. Log in with the existing test account `WTBTEST / 123456` and confirm the
   blocked `新增记录` action resumes in place.
8. Confirm the notebook panel loads either the current saved list or the empty
   state for that account.
9. In the editor dialog, confirm the default date and time use the current
   Beijing time.
10. Change the date and time with the scrollable selectors and confirm tapping
    elsewhere closes the selector and writes the chosen value.
11. Enter a bird name, bird point, and a remark shorter than 100 characters;
    tap `添加`; confirm the item appears in the list and the stats update.
12. Tap the saved item and confirm the editor opens with the previous values in
    edit mode.
13. Modify the record and tap `保存`; confirm the card content and summary
    update without leaving the current page.
14. Use the location icon and confirm successful device location fills the bird
    point field without clearing other draft fields; when reverse geocoding is
    unavailable, the form should fall back to readable coordinates.
15. Use the `地图` picker and confirm choosing a point fills the bird point
    field; canceling the picker must preserve the prior field value.
16. Modify a draft and tap `取消`; confirm the dialog asks
    `是否放弃编辑？`, then verify both `否` and `是` behave correctly.
17. Tap a record’s trash icon and confirm the delete dialog asks
    `确认删除此记录？`.
18. Delete the record and confirm the list and stats update immediately.
19. Refresh the page and confirm the logged-in user still sees the same account
    notebook content while the server remains running.

## Implementation Notes

- Keep notebook CRUD behind `app/api/records/notebook/**`.
- Keep coordinate-to-label resolution behind
  `app/api/records/location/resolve/route.ts`.
- Keep notebook files scoped by assistant account under `data/notebooks/`.
- Keep all visible copy in Simplified Chinese.
- Reuse Tailwind CSS + shadcn/ui primitives for the notebook panel and dialogs.
- Reuse the existing AMap loader for map selection.
- Chart scope is `N/A`.
