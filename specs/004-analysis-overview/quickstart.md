# Quickstart: 分析总览核心信息

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing analysis map, weather, and birding index feature already implemented
- Current `.env` values already support the existing weather + birding route

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
2. Confirm the analysis screen still shows the map panel and the weather +
   birding panel.
3. Confirm a new `分析总览` block appears directly below the weather/birding panel.
4. Confirm the old placeholder title/content combination (`观鸟指数分析`,
   `今日概览`, placeholder summary) no longer appears.
5. Confirm the overview shows one Beijing-time string in the format
   `2026年4月1日 09:30`.
6. Confirm the overview does not display a visible `当前时段` label.
7. Confirm the overview shows exactly three rows:
   `栖息地活跃度`、`迁徙信号`、`观测可信度`。
8. Confirm `观测可信度` always displays `稳定`.
9. Switch parks and confirm the overview refreshes with the latest
   weather/birding result and does not retain stale values.
10. Trigger or simulate birding-index unavailability while weather remains
    available, then confirm `栖息地活跃度` displays `暂不可用` while the other
    two rows still render.
11. Validate the current real-time Beijing display format in the UI.
12. Validate the six habitat-activity rule windows and the month-based
    migration mapping by invoking the pure overview helper with controlled
    Beijing-time inputs during development.

## Implementation Notes

- Reuse the existing `GET /api/analysis/birding-outlook` request path.
- Extend the existing normalized response shape instead of adding a second API.
- Derive Beijing time on the server using `Asia/Shanghai`.
- Format the visible time string as `YYYY年M月D日 HH:mm`.
- Keep the overview UI implemented with Tailwind CSS + shadcn/ui primitives.
- Keep chart scope as `N/A`.

## Validation Status

- Static validation completed on `2026-04-01`:
  `npm run lint` passed, `npx tsc --noEmit` passed, `npm run build` passed.
- Browser-based manual validation is still pending in an interactive mobile
  viewport session.

## Current Implementation Notes

- `分析总览` now reuses the existing `GET /api/analysis/birding-outlook`
  request and does not trigger a second client fetch.
- Beijing time is generated on the server with `Asia/Shanghai` and rendered as
  `YYYY年M月D日 HH:mm`.
- The overview keeps exactly three rows: `栖息地活跃度`、`迁徙信号`、
  `观测可信度`.
- No visible `当前时段` label is rendered.
- When birding-index assessment is unavailable but weather succeeds,
  `栖息地活跃度` renders `暂不可用`, and the other two rows remain visible.
- On failed or superseded requests, the overview panel does not show stale
  values.
