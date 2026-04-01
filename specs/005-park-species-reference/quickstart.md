# Quickstart: 栖息地鸟种参考

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing analysis page modules already run successfully
- Workbook assets exist under `F:\VibeCoding\watch_the_bird\parkinfo`
- Current workbook files at planning time:
  - `Bijiashan Park.xlsx`
  - `Fairylake Botanical Garden.xlsx`
  - `Shenzhen Bay Park.xlsx`
  - `Shenzhen Donghu Park.xlsx`

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
    missing, or unreadable workbook fixture during development.
14. Validate the list scrolls vertically with natural inertia and a lightweight
    snap effect, without introducing horizontal overflow.

## Current Workbook Smoke-Test Notes

- At planning time, inspected workbook row counts (excluding headers) were:
  - `深圳湾公园`: 32
  - `笔架山公园`: 36
  - `仙湖植物园`: 36
  - `深圳东湖公园`: 58
- If these source files remain unchanged, the preview mode should still cap at
  10 and the full mode should match the inspected total counts above.
- 2026-04-01 implementation smoke test:
  - `深圳湾公园` preview response returned `10 / 32`
  - `深圳湾公园` full response returned `32 / 32`

## Implementation Notes

- Keep Excel parsing behind `GET /api/analysis/habitat-species-reference`.
- Keep workbook path resolution inside the server runtime and do not expose file
  paths to the browser.
- Keep the park-to-workbook lookup explicit in
  `lib/species/park-species-workbooks.ts`; do not derive filenames from `parkId`.
- Use Tailwind CSS + shadcn/ui primitives for the list and modal surface.
- Use native scrolling plus CSS snap behavior for the mobile list interaction.
- Keep chart scope as `N/A`.
