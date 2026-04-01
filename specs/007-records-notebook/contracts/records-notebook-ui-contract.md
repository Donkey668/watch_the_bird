# UI Contract: Records Notebook

## Route Surface

- **Route**: `/`
- **Primary screen**: `记录`
- **Primary container**: 现有 `个人空间 / 个人观测记录` 标题及注释下方

## Layout Contract

- Keep the existing title `个人空间` and heading `个人观测记录` with the current
  explanatory note.
- Insert the notebook panel directly below the title block and keep it within
  the mobile shell width with no horizontal overflow at `375px` to `430px`.
- The notebook panel top-left must show `X 条记录 / Y 个鸟种`.
- A separator must appear below the stats row.
- The record list appears below the separator as a vertical stack of tappable
  items.
- A centered `新增记录` action appears near the bottom of the records screen.

## Record Item Contract

- Each item’s left-top content shows:
  - first line: `YYYY-MM-DD HH:mm` + `鸟点`
  - second line: `鸟名`
- Each item’s right-top corner shows a trash icon.
- Tapping the item opens the editor dialog.
- Tapping the trash icon opens a confirmation dialog with `确认删除此记录？`.

## Editor Dialog Contract

- The editor opens above the fixed top navigation and any page content.
- New entries default to the current Beijing date and time.
- Existing entries load their saved values into the form.
- Required fields:
  - 日期选择器
  - 时间选择器
  - 鸟名输入框
  - 鸟点输入框
  - 备注输入框
- 鸟点输入区右上侧提供两个操作入口:
  - 定位图标
  - `地图` 文本按钮
- `备注` is limited to 100 characters.
- The footer actions are `添加` and `取消`.
- Choosing `取消` after the draft becomes dirty must open `是否放弃编辑？`.

## Date/Time Picker Contract

- Date and time are separate scrollable selectors.
- Selecting a value then tapping outside the selector closes that selector and
  writes the selected value into the form.
- The selectors must be usable within the mobile dialog height and must not
  force page-level horizontal scroll.

## Auth Interception Contract

- Protected notebook interactions must not navigate away from the current page.
- If the user is not logged in and taps `新增记录` or any notebook-only action,
  the page opens the existing login dialog in place.
- The notebook-triggered login flow depends on `POST /api/auth/login`
  distinguishing:
  - `account_not_found`
  - `invalid_password`
- When the login result is `account_not_found`, the UI must show
  `请先注册助手账号！`.
- When the notebook-triggered login dialog closes without success, the UI must
  show a follow-up reminder dialog with `请登录个人空间！` and a close action.

## Map And Location Contract

- Tapping the location icon requests device coordinates and keeps the current
  draft intact on failure.
- Tapping `地图` opens an in-page map picker dialog rendered above other layers.
- The map picker allows selecting one point and confirming or canceling.
- Canceling map selection must not overwrite the current bird point text.
- Confirming location resolution fills the bird point field and records the
  location source.

## Loading, Empty, Error, And Motion Contract

- Authenticated users must see a loading state before notebook data returns.
- Empty state copy must remain Simplified Chinese and still preserve the
  notebook panel structure.
- Save, delete, and location actions must show scoped pending feedback without
  blocking the whole page unnecessarily.
- Error messages must remain Simplified Chinese and stay local to the relevant
  dialog or panel.
- Dialogs and reminder overlays must render above the fixed top bar.
- Charts remain `N/A` for this feature.
