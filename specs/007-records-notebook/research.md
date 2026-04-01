# Research: 记录页记事本

## Decision 1: Use a file-backed notebook repository on the server

- **Decision**: Persist notebook data in per-account JSON documents under
  `data/notebooks/`, accessed only through a server-side repository helper.
- **Rationale**: The feature requires a server-side notebook repository bound to
  the assistant account and visible again after page refresh. A file-backed
  repository satisfies that requirement, stays inspectable during local
  development, and aligns with the repository’s existing `fs/promises` + JSON
  data-source pattern.
- **Alternatives considered**:
  - Keep notebook data only in a `globalThis` in-memory `Map`.
    Rejected because records would disappear when the server process restarts
    and are harder to inspect or recover during development.
  - Introduce a database.
    Rejected because no database dependency or deployment contract exists in the
    current project scope.

## Decision 2: Guard notebook data at the Route Handler boundary

- **Decision**: Add a shared server-side auth resolver that reads
  `wtb_auth_session` from `cookies()` and rejects notebook CRUD requests before
  any repository access when the session is missing or invalid.
- **Rationale**: Next.js guidance favors doing auth checks close to the data
  source. This keeps notebook data isolated per assistant account and prevents
  client-only gating from becoming the only line of defense.
- **Alternatives considered**:
  - Check auth only in client components.
    Rejected because protected data would still be reachable from public
    endpoints.
  - Bind notebook records to a client-generated identifier.
    Rejected because the notebook must be tied to the logged-in assistant
    account on the server.

## Decision 3: Refine the existing login result model for notebook interception

- **Decision**: Extend the existing `POST /api/auth/login` contract so notebook
  login attempts can distinguish `account_not_found` from `invalid_password`.
- **Rationale**: The notebook spec explicitly requires the in-place prompt
  `请先注册助手账号！` when the account does not exist. The current generic
  invalid-credential result is not sufficient for that behavior.
- **Alternatives considered**:
  - Keep one generic invalid-credential status.
    Rejected because it cannot drive the required account-not-found message.
  - Add a separate “check account exists” endpoint.
    Rejected because it adds an unnecessary extra round-trip for the same form
    submission.

## Decision 4: Keep notebook UI in the existing records screen with top-layer dialogs

- **Decision**: Convert `RecordsScreen` into a client-side container that
  renders the notebook panel in-page and opens editor, delete-confirm,
  discard-confirm, map-picker, login, and reminder dialogs as top-layer
  overlays.
- **Rationale**: The user explicitly requires staying on the current page
  context with no navigation when adding, editing, deleting, or being prompted
  to log in. The existing shadcn-style `Dialog` primitive already supports the
  required layering model.
- **Alternatives considered**:
  - Move editing to a dedicated route.
    Rejected because it breaks the “原地弹出” interaction requirement.
  - Render inline editors inside the list.
    Rejected because it complicates mobile layout and conflicts with the
    top-layer editing requirement.

## Decision 5: Use browser coordinates plus a backend location-resolution endpoint

- **Decision**: Device location and map point selection will both produce
  coordinates in the client, then call a dedicated Route Handler
  `GET /api/records/location/resolve` to convert those coordinates into the bird
  point text shown in the form.
- **Rationale**: This keeps external service access behind a Route Handler,
  preserves the frontend/backend contract boundary, and allows the server to
  normalize Chinese place labels consistently. If reverse geocoding cannot
  return a descriptive address, the endpoint can still return a readable
  coordinate fallback string.
- **Alternatives considered**:
  - Fill the bird point field with raw coordinates only.
    Rejected because it produces a weak user-facing notebook entry.
  - Call reverse geocoding services directly from the browser.
    Rejected because the repository constitution prefers frontend calls through
    backend contracts when server-side capability is involved.

## Decision 6: Reuse the existing AMap loader for map picking

- **Decision**: Build the “地图” picker as a dialog-local AMap instance that
  reuses `lib/maps/amap-loader.ts`, centers on the current park context or last
  chosen point, and lets the user tap to place or move a marker before
  confirming the selection.
- **Rationale**: The project already ships `@amap/amap-jsapi-loader` and a
  working mobile map panel. Reusing that loader avoids a second map dependency
  and stays aligned with current environment-variable conventions.
- **Alternatives considered**:
  - Replace AMap with another client map library.
    Rejected because it would violate the project’s existing map stack and add
    needless dependency surface.
  - Open an external map page or app for selection.
    Rejected because it breaks the in-page modal requirement.

## Decision 7: Implement date and time pickers with local scroll-snap selectors

- **Decision**: Use custom date and time selectors inside the editor dialog,
  implemented with Tailwind CSS, existing local primitives, and CSS scroll snap
  instead of adding a third-party mobile picker package.
- **Rationale**: The repo does not currently need a new dependency to satisfy
  the scrollable picker requirement. Existing UI primitives and mobile layout
  constraints are enough for a focused selector with outside-click dismissal.
- **Alternatives considered**:
  - Install a dedicated mobile picker library.
    Rejected because no blocking capability gap exists in the current
    dependency set.
  - Use plain text inputs for date and time.
    Rejected because the spec explicitly asks for separate dropdown/scroll
    selectors.

## Decision 8: No new dependency is required for the planned implementation

- **Decision**: Proceed without introducing additional npm packages in Phase 1.
- **Rationale**: Existing dependencies already cover dialogs, buttons, inputs,
  the AMap loader, and the server/runtime APIs needed for the notebook
  workflow. Any remaining UI primitives such as `Textarea` can be added locally
  in the repository’s shadcn-style component layer.
- **Alternatives considered**:
  - Add an icon package or modal-specific package for convenience.
    Rejected because inline SVGs and existing dialog primitives are sufficient.
  - Add a form library.
    Rejected because the form scope is small and can be validated with local
    TypeScript helpers.
