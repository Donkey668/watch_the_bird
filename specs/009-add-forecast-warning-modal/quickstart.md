# Quickstart: 天气与观鸟指数预报预警弹窗

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing analysis map and weather-outlook feature already available
- Shenzhen Open Data appKey already申请并可调用四个指定接口

## Environment Setup

Configure local `.env` with required server-side keys:

```bash
AMAP_WEATHER_KEY=<your-amap-weather-key>
SZ_WEATHER_APP_KEY=<your-shenzhen-forecast-warning-appkey>
```

Implementation notes:

- `SZ_WEATHER_APP_KEY` is shared across all four forecast/warning upstream
  interfaces.
- `SZ_WEATHER_APP_KEY` must be read on the server only.
- Frontend must never access this key directly.
- Upstream requests must include `appKey`, `page`, `rows`; optional
  `startDate/endDate` should be used for on-demand windowing when useful.

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

1. Open `/` and switch to `分析` page.
2. Confirm `天气与观鸟指数` card still renders existing content normally.
3. Confirm below `请求时间 / 刷新结果` a deep-green button
   `点击获取预报预警` is visible.
4. Click the button and confirm modal opens at top layer with vertical scrolling.
5. Confirm modal data reflects current selected park district.
6. Confirm `分区逐时预报` shows only post-current-Beijing-time `DDATETIME`
   rows and renders card lines as `WEATHERSTATUS` -> `QPFTEMP` -> `DDATETIME`.
7. Confirm `分区预报` shows today-and-later rows and renders card lines as
   `WEATHERSTATUS` -> `MINTEMPERATURE/MAXTEMPERATURE` -> `DDATETIME`.
8. Confirm both forecast modules use horizontal scrolling when cards overflow.
9. Confirm `日月时刻` shows today rows with each
   `ATTRIBNAME/ATTRIBVALUE` as one separated line.
10. Confirm `灾害预警` only renders currently effective `发布` records that are
    not canceled.
11. Confirm warning row text format is
    `序号 SIGNALTYPE SIGNALLEVEL预警` and colors follow `SIGNALLEVEL`.
12. Confirm when `SIGNALTYPE` exists but `SIGNALLEVEL` is empty, row color is yellow.
13. Confirm when both `SIGNALTYPE` and `SIGNALLEVEL` are empty, only gray text
    `当前无生效信号。` is shown.
14. Click a valid warning row and confirm detail popup shows
    `ISSUECONTENT` and `DISTRICT`.
15. Switch park and reopen/refresh modal; confirm data context follows new district.
16. Confirm no new horizontal overflow is introduced except intended card lists.

## Validation Status

- Planning stage only: implementation validation is still pending.

## Implementation Notes

- Use one Route Handler to aggregate four upstream APIs and normalize data.
- Keep all four module states independent in one response payload.
- Use bounded `rows` and optional date-window parameters to reduce dataset
  consumption.
- Keep all user-visible copy in Simplified Chinese.
- Chart scope remains `N/A`.
