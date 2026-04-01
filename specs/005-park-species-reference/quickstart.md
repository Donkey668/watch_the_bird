# Quickstart: 栖息地鸟种参考

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing analysis page modules already run successfully
- JSON assets exist under `F:\VibeCoding\watch_the_bird\parkinfo`
- Current source files:
  - `Bijiashan Park.json`
  - `Fairylake Botanical Garden.json`
  - `Shenzhen Bay Park.json`
  - `Shenzhen Donghu Park.json`

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
2. Confirm the analysis screen still shows the existing map and weather/birding
   modules.
3. Confirm a new `栖息地鸟种参考` module appears below the current analysis
   content stack and above `如何使用本页面`.
4. Confirm the initial request loads preview data for the current park only.
5. Confirm each visible preview card shows `序号`、`鸟种名称`、`居留类型`、
   `保护级别`.
6. Confirm no more than 10 cards appear on the initial preview render.
7. If the current park has more than 10 records, confirm the bottom action area
   shows `点击查看全部信息`.
8. Tap one card and confirm a top-layer modal opens above the fixed top bar.
9. Confirm the modal shows `生态特征` and `观测难度` on separate lines.
10. Close the modal and confirm the list returns to the same scroll position.
11. Tap `点击查看全部信息` and confirm the module loads the complete record list
    for the current park.
12. Switch parks and confirm the species module refreshes to the new park
    without leaving stale cards or stale modal content.
13. Validate empty-state and error-state copy by temporarily using an empty,
    missing, or unreadable JSON fixture during development.
14. Validate the list scrolls vertically with natural inertia and a lightweight
    snap effect, without introducing horizontal overflow.

## Current Source Smoke-Test Notes

- Current JSON row counts were:
  - `深圳湾公园`: 30
  - `笔架山公园`: 20
  - `仙湖植物园`: 20
  - `深圳东湖公园`: 58
- If these source files remain unchanged, the preview mode should still cap at
  10 and the full mode should match the inspected total counts above.
- 2026-04-01 JSON migration smoke test:
  - `深圳湾公园` preview response returned `10 / 30`
  - `深圳湾公园` full response returned `30 / 30`

## Implementation Notes

- Keep JSON source parsing behind `GET /api/analysis/habitat-species-reference`.
- Keep source path resolution inside the server runtime and do not expose file
  paths to the browser.
- Keep the park-to-source lookup explicit in
  `lib/species/park-species-sources.ts`; do not derive filenames from `parkId`.
- Use Tailwind CSS + shadcn/ui primitives for the list and modal surface.
- Use native scrolling plus CSS snap behavior for the mobile list interaction.
- Keep chart scope as `N/A`.
