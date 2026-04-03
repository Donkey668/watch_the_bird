# UI Contract: Analysis Forecast Warning Modal

## Route Surface

- **Route**: `/`
- **Primary container**: Analysis screen inside existing mobile shell
- **Entry position**: Inside `天气与观鸟指数` panel, below the
  `请求时间 / 刷新结果` row

## Layout Contract

- Keep existing analysis map and weather panel order unchanged.
- Add one deep-green rounded rectangle CTA button with centered white text:
  `点击获取预报预警`.
- Clicking CTA opens a top-layer modal (overlay above page content) with
  vertically scrollable content.
- Modal contains four independent rounded modules in this order:
  `分区逐时预报` -> `分区预报` -> `日月时刻` -> `灾害预警`.
- UI must stay readable at portrait widths 375px to 430px without unintended
  horizontal overflow (except intentionally horizontal card lists in two modules).

## Content Contract

### Required visible content

| Section | Required Content |
|---------|------------------|
| Modal title context | 当前公园 + 区县上下文说明 |
| 分区逐时预报 | 卡片三行：`WEATHERSTATUS`、`QPFTEMP`、`DDATETIME` |
| 分区预报 | 卡片三行：`WEATHERSTATUS`、`MINTEMPERATURE/MAXTEMPERATURE`、`DDATETIME` |
| 日月时刻 | 逐行 `ATTRIBNAME` + `ATTRIBVALUE`，行间分隔线 |
| 灾害预警 | 逐行文本 `序号 SIGNALTYPE SIGNALLEVEL预警`，颜色随级别 |

### Explicit exclusions

- Do not add new top-level navigation tabs or routes.
- Do not expose raw upstream payload JSON directly.
- Do not replace existing `请求时间` and `刷新结果` behavior.
- Do not introduce Apache ECharts visualizations in this feature.

## State Contract

### Modal closed state

- CTA button remains visible and enabled.
- Existing weather panel states remain unchanged.

### Modal opening/loading state

- Modal appears immediately after click.
- Each module can show its own loading placeholder.
- One module loading must not block rendering of already resolved modules.

### Module success state

- `分区逐时预报` and `分区预报` render as horizontal scroll card lists when
  card count exceeds visible width.
- `日月时刻` renders line-by-line key/value rows with separators.
- `灾害预警` renders warning text lines with level color mapping.

### Module empty state

- Each module shows Simplified Chinese empty-state text inside its own rounded
  container.
- Empty state is module-local and does not collapse other modules.

### Module failure state

- Failed module shows module-local error message and keeps other modules visible.
- User can keep reading non-failed modules in same modal session.

### Disaster warning special rules

- If `SIGNALTYPE` exists and `SIGNALLEVEL` is empty, row color defaults to yellow.
- If `SIGNALTYPE` and `SIGNALLEVEL` are both empty, show only
  `当前无生效信号。` in `gray-400`.
- Clicking any non-placeholder warning row opens a detail dialog showing
  `ISSUECONTENT` and `DISTRICT`.

## Interaction Contract

- Tap CTA -> open modal and trigger one aggregated request for current `parkId`.
- Switching park context requires next modal data request to bind to latest
  district context.
- `分区逐时预报` and `分区预报` support horizontal swipe/scroll within module.
- Tapping warning line opens detail popup; closing popup returns to modal list.
- Modal close should not mutate park selection or existing weather panel result.
