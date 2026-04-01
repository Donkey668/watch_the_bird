# UI Contract: Habitat Species Reference

## Route Surface

- **Route**: `/`
- **Primary container**: Analysis screen inside the existing mobile shell
- **Panel position**: Below the current analysis content stack and above the
  static `如何使用本页面` helper card

## Layout Contract

- The module is rendered as one full-width card aligned to the same content
  width as the existing analysis modules.
- The module must fit portrait widths from 375px to 430px without horizontal
  scrolling.
- The visible module title must be `栖息地鸟种参考`.
- The list surface must support vertical scrolling inside the module without
  breaking the page’s natural vertical scrolling.

## Content Contract

### Required visible content

| Section | Required Content |
|---------|------------------|
| Header | Title `栖息地鸟种参考` and a short Chinese helper line describing the current park context |
| Card row | `序号`、`鸟种名称`、`居留类型`、`保护级别` |
| Modal | `生态特征` and `观测难度`, displayed on separate lines |
| Load more | `点击查看全部信息` button when total rows exceed 10 |

### Explicit exclusions

- Do not expose raw source filenames to end users.
- Do not require horizontal scrolling to read any field.
- Do not introduce charts for this feature.

## State Contract

### Loading state

- On first load, show a lightweight loading placeholder for the species module.
- On full-load expansion, keep the module visible and show a scoped loading
  state near the bottom action area rather than blanking the whole page.

### Success state

- Render a vertically scrollable card list in source order.
- Preview state shows at most 10 cards.
- Full state shows all cards and removes or replaces the load-more trigger.
- Each card is tappable and visually indicates interactivity.

### Empty state

- If the JSON source is readable but contains no valid records, show a dedicated
  Chinese empty-state message inside the module.

### Error state

- If the JSON source is missing or unreadable, show a scoped Chinese error state
  inside the module.
- The error state must not hide unrelated analysis modules above it.

## Interaction Contract

- Tapping a species card opens a top-layer modal using a portal-backed dialog.
- The modal must always appear above the fixed top navigation and other
  overlays.
- Closing the modal returns the user to the same card-list scroll position.
- Tapping `点击查看全部信息` requests and renders the full dataset for the
  current park only.
- Switching parks resets preview/full state to the newest park selection and
  prevents stale cards from the previous park from flashing as current data.

## Motion And Scroll Contract

- The list container uses touch-friendly native scrolling with a lightweight
  snap effect between cards.
- Scrolling enhancements must remain subtle and must not trap the user inside
  the module.
- Modal open/close motion may use simple fade/scale transitions, but the
  interaction must remain fast and unobtrusive on mobile devices.
