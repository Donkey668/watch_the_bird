# UI Contract: Analysis Overview

## Route Surface

- **Route**: `/`
- **Primary container**: Analysis screen within the existing mobile shell
- **Panel position**: Immediately below the existing weather and birding
  outlook panel

## Layout Contract

- The overview is rendered as its own full-width content block below the
  weather/birding panel, aligned to the same content width.
- The overview must fit portrait widths from 375px to 430px without horizontal
  scrolling.
- The old placeholder title stack (`分析总览` + `观鸟指数分析` + `今日概览`) must be
  replaced by one real section title only: `分析总览`.

## Content Contract

### Required visible content

| Section | Required Content |
|---------|------------------|
| Header | Only the title `分析总览` |
| Time context | One Beijing-time text string in `YYYY年M月D日 HH:mm` format |
| Summary row 1 | `栖息地活跃度` and its current value |
| Summary row 2 | `迁徙信号` and its current value |
| Summary row 3 | `观测可信度` and the fixed value `稳定` |

### Explicit exclusions

- Do not render a visible `当前时段` label.
- Do not keep the old placeholder summary description text.
- Do not render chart content for this feature.

## State Contract

### Loading state

- While the shared birding-outlook request is loading, the overview area should
  show a lightweight skeleton or loading placeholder below the weather card.
- The loading state must not display stale values from a previous park
  selection as if they belonged to the new selection.

### Success state

- Show the Beijing-time text above the overview rows.
- Show exactly three labeled summary rows.
- Keep all copy in Simplified Chinese.

### Partial success state

- Continue showing Beijing time, migration signal, and observation confidence.
- Render `栖息地活跃度` with the value `暂不可用`.
- Do not invent another fallback habitat-activity level.

### Failure state

- If the shared request fully fails, the page must not render stale overview
  values below the weather error state.
- If an overview-specific unavailable surface is shown, it must remain
  non-blocking and scoped to the overview area only.

## Interaction Contract

- The overview refreshes automatically when the selected park changes.
- The overview always follows the latest park selection and latest shared
  response.
- The overview itself does not introduce a new button group, tab, or route.
