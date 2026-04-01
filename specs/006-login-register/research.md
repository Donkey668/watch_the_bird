# Research: 登录/注册入口与弹窗

## Decision 1: Use one dedicated login Route Handler

- **Decision**: Add `POST /api/auth/login` as the only backend-facing contract
  for identity validation in this feature slice.
- **Rationale**: The feature currently needs only credential verification for a
  single built-in account. One Route Handler keeps the boundary explicit and
  satisfies the repository constitution without inventing a broader auth system.
- **Alternatives considered**:
  - Validate the test account directly in client components.
    Rejected because it bypasses the required API boundary.
  - Introduce a full auth suite with logout, refresh, and registration
    endpoints.
    Rejected because it expands scope beyond the current requirement.

## Decision 2: Keep login validation server-side and session state client-local

- **Decision**: Store the built-in test credential in a server-only helper and
  keep the resulting logged-in state in the current client session only.
- **Rationale**: The spec explicitly allows login state to reset on refresh, so
  a lightweight session-local state is enough for the current slice while still
  keeping credential checks off the client.
- **Alternatives considered**:
  - Persist auth with cookies or local storage.
    Rejected because the current feature does not require persistent sessions.
  - Use a database-backed identity store.
    Rejected because the feature only needs a single built-in test account.

## Decision 3: Place the auth entry in the mobile shell, not inside each screen

- **Decision**: Render the login/register entry from the shared mobile shell so
  it remains visible under the fixed top navigation across all three screens.
- **Rationale**: The requirement applies to the whole website, not a single
  tab. Shell-level composition avoids duplicating auth UI in `分析`、`识别`、`记录`
  screens and keeps placement consistent.
- **Alternatives considered**:
  - Duplicate the entry inside each screen component.
    Rejected because it risks drift in position, state, and styling.
  - Add the entry inside the fixed top navigation itself.
    Rejected because the user explicitly asked for placement below the nav bar.

## Decision 4: Use shared dialog primitives for both login and registration

- **Decision**: Implement both login and registration guidance with the
  existing shadcn-style `Dialog` primitive and one shared dialog composition.
- **Rationale**: Both flows are lightweight overlays that must render above the
  top navigation. Reusing the existing dialog primitive keeps behavior,
  layering, and motion consistent.
- **Alternatives considered**:
  - Build separate custom overlays.
    Rejected because it duplicates accessibility and layering behavior.
  - Use inline expansion panels.
    Rejected because the requirement explicitly asks for popup dialogs.

## Decision 5: Treat registration as a static guidance flow

- **Decision**: The registration action opens a static guidance dialog with a
  default administrator avatar and the message “请联系管理员注册与登录”.
- **Rationale**: The requirement explicitly states that registration is not open
  yet. A static guidance flow makes that limitation clear without implying
  self-service account creation.
- **Alternatives considered**:
  - Show a disabled registration form.
    Rejected because it creates false expectations.
  - Hide the registration entry entirely.
    Rejected because the user explicitly requested both login and register
    entries.

## Decision 6: Add a repo-local administrator avatar asset

- **Decision**: Use a local image under `public/images/` as the default
  administrator avatar shown in the registration dialog.
- **Rationale**: A repo-local asset avoids dependence on external URLs and
  keeps the feature deterministic in offline and local-development scenarios.
- **Alternatives considered**:
  - Load a remote placeholder avatar.
    Rejected because it introduces unnecessary network dependence.
  - Use a text-only registration notice.
    Rejected because the feature explicitly asks for an avatar image above the
    message.
