# Research: 栖息地鸟种参考

## Decision 1: Use a dedicated Route Handler with preview/full query modes

- **Decision**: Add `GET /api/analysis/habitat-species-reference?parkId=...&view=preview|full`
  as the only frontend-facing contract for this feature.
- **Rationale**: Preview and full load are the same resource with different
  response sizes, so one endpoint keeps the contract simple while preserving
  the App Router Route Handler boundary required by the constitution.
- **Alternatives considered**:
  - Create separate `/preview` and `/full` endpoints.
    Rejected because it duplicates validation and response shaping logic.
  - Read Excel directly in the client.
    Rejected because it violates the backend contract boundary and exposes file
    parsing to the browser.

## Decision 2: Parse Excel on the server with `xlsx`

- **Decision**: Read workbooks only on the server in a Node.js Route Handler
  and parse them with the `xlsx` package.
- **Rationale**: The source material is explicitly provided as Excel files, and
  `xlsx` is the lowest-friction way to support the current `.xlsx` assets
  without hand-writing XML/ZIP parsing logic.
- **Alternatives considered**:
  - Convert Excel files to JSON or CSV ahead of time.
    Rejected because the requirement explicitly treats Excel as the source of
    truth and does not ask for an offline conversion workflow.
  - Build a custom XLSX parser with ZIP/XML primitives.
    Rejected because it increases maintenance cost and risk for a solved problem.

## Decision 3: Keep workbook mapping explicit and park-id based

- **Decision**: Maintain a server-side registry mapping `ParkId` values to
  workbook filenames in `parkinfo/`, including explicit aliases for mismatched
  names such as `shenzhen-east-lake-park -> Shenzhen Donghu Park.xlsx`.
- **Rationale**: The workbook filenames do not perfectly match the existing
  `ParkId` strings, so an explicit mapping avoids brittle name-derivation rules.
- **Alternatives considered**:
  - Infer file names from translated park names.
    Rejected because current names mix English and pinyin and are not
    reversible with guaranteed correctness.
  - Store the workbook path directly in `park-options.ts`.
    Rejected because species-reference file concerns are better isolated from
    map configuration.

## Decision 4: Parse the full workbook per request, then slice for preview

- **Decision**: For the current scope, parse the selected workbook into a
  normalized record array on each request and derive preview/full payloads by
  slicing in memory.
- **Rationale**: The inspected workbook sizes are small enough for this to stay
  simple and fast: current files contain roughly 32, 36, 36, and 58 usable
  records after excluding headers.
- **Alternatives considered**:
  - Add an in-memory workbook cache keyed by file path and modification time.
    Rejected because the current data volume does not justify extra coherence
    and invalidation complexity.
  - Stream rows incrementally from the workbook.
    Rejected because the preview/full requirement needs total counts and does
    not benefit from a streaming API at this scale.

## Decision 5: Normalize missing detail fields into explicit Chinese fallback text

- **Decision**: If a row lacks `生态特征` or `观测难度`, normalize the missing
  field to explicit fallback copy rather than returning an empty string.
- **Rationale**: The spec requires missing fields to remain understandable and
  must not leave the modal looking broken or empty.
- **Alternatives considered**:
  - Omit missing fields from the payload.
    Rejected because the modal contract expects both lines to exist.
  - Render blank lines in the modal.
    Rejected because users may interpret them as a rendering bug.

## Decision 6: Use shadcn `Dialog` for the detail modal

- **Decision**: Implement the species-detail modal with a shadcn `Dialog`
  primitive mounted through a portal.
- **Rationale**: The feature explicitly requires a top-layer modal, and the
  repository constitution prefers shadcn/ui when an appropriate primitive exists.
- **Alternatives considered**:
  - Reuse a custom inline overlay.
    Rejected because layering and accessibility behavior are more robust when
    delegated to a dialog primitive.
  - Use a bottom sheet interaction.
    Rejected because the requirement explicitly asks for a modal, not a sheet.

## Decision 7: Achieve smooth list browsing with native scrolling + CSS snap

- **Decision**: Use a vertically scrollable container with native touch inertia
  and CSS snap behavior (`snap-y`, `snap-proximity`, and overscroll control)
  instead of a JavaScript scrolling library.
- **Rationale**: Mobile browsers already provide inertia; the main need is
  gentle snap alignment that improves readability without fighting the page’s
  natural vertical scroll.
- **Alternatives considered**:
  - Add a JavaScript gesture or carousel library.
    Rejected because it adds weight and can interfere with the page’s normal
    mobile scrolling behavior.
  - Avoid snap behavior entirely.
    Rejected because the requirement explicitly asks for a lightweight snap-like
    enhancement to scrolling smoothness.

## Decision 8: Treat empty source data as a first-class UI state

- **Decision**: Distinguish between “文件存在但无有效记录” and “文件缺失/无法读取”.
- **Rationale**: An empty dataset is not the same failure mode as a missing or
  unreadable workbook, and the UI should help users understand that difference.
- **Alternatives considered**:
  - Collapse all non-success outcomes into one generic failure state.
    Rejected because it prevents meaningful debugging and user feedback.
  - Treat empty as success with no special metadata.
    Rejected because the UI still needs a dedicated empty-state copy path.
