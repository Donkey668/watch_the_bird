# UI Contract: Auth Entry And Dialogs

## Route Surface

- **Route**: `/`
- **Primary container**: Shared mobile shell rendered under the fixed top
  navigation
- **Panel position**: Fixed top navigation remains first; auth entry sits below
  it and aligns to the right side of the shell content area

## Layout Contract

- The auth entry must fit portrait widths from 375px to 430px without
  horizontal scrolling.
- The entry consists of two clearly tappable actions in the guest state:
  `登录` and `注册`.
- The authenticated state replaces the guest actions with a clear logged-in
  indicator and assistant account label.

## Content Contract

### Login dialog

- Title and helper copy are Simplified Chinese.
- Required fields: `助手账号`, `用户密码`
- Required actions: submit and close
- Required feedback: loading state, empty-field validation, invalid-credential
  error

### Registration dialog

- Must show a default administrator avatar image near the top of the dialog.
- Must show the message `请联系管理员注册与登录`.
- Must not show any submit button that implies open self-service registration.

## Interaction Contract

- Tapping `登录` opens the login dialog.
- Tapping `注册` opens the registration guidance dialog.
- Only one auth dialog may be open at a time.
- Successful login closes the dialog and updates the auth entry state.
- Failed login keeps the dialog open and surfaces a scoped Chinese error.
- Switching between `分析`、`识别`、`记录` keeps the current session auth state.

## Motion And Layering Contract

- Dialogs must render above the fixed top navigation and any screen-specific
  overlays.
- Dialog open/close motion may use the repository’s existing dialog fade/scale
  behavior.
- The auth entry and dialogs must not introduce horizontal overflow.
