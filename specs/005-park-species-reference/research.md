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
  - Read JSON directly in the client.
    Rejected because it violates the backend contract boundary and exposes file
    parsing to the browser.

## Decision 2: Parse JSON on the server in the Route Handler

- **Decision**: Read the park-specific JSON files only on the server in the
  Route Handler and parse them directly with Node.js.
- **Rationale**: The source material is now stored as repository-local JSON
  files, so direct server-side JSON parsing is simpler, faster, and removes the
  need for any Excel-specific adapter layer.
- **Alternatives considered**:
  - Keep the previous JSON-via-Python compatibility layer.
    Rejected because JSON no longer needs a Python-side parser.
  - Read JSON directly in the client.
    Rejected because it would bypass the required API boundary.

## Decision 3: Keep source mapping explicit and park-id based

- **Decision**: Maintain a server-side registry mapping `ParkId` values to
  JSON filenames in `parkinfo/`, including explicit aliases for mismatched
  names such as `shenzhen-east-lake-park -> Shenzhen Donghu Park.json`.
- **Rationale**: The source filenames do not perfectly match the existing
  `ParkId` strings, so an explicit mapping avoids brittle name-derivation rules.
- **Alternatives considered**:
  - Infer file names from translated park names.
    Rejected because current names mix English and pinyin and are not
    reversible with guaranteed correctness.
  - Store the source path directly in `park-options.ts`.
    Rejected because species-reference file concerns are better isolated from
    map configuration.

## Decision 4: Parse the full JSON source per request, then slice for preview

- **Decision**: For the current scope, parse the selected JSON source into a
  normalized record array on each request and derive preview/full payloads by
  slicing in memory.
- **Rationale**: The current JSON files are small enough for this to stay
  simple and fast: current files contain roughly 20, 20, 30, and 58 usable
  records, depending on the park.
- **Alternatives considered**:
  - Add an in-memory source cache keyed by file path and modification time.
    Rejected because the current data volume does not justify extra coherence
    and invalidation complexity.
  - Stream rows incrementally from the JSON source.
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
  unreadable JSON source, and the UI should help users understand that
  difference.
- **Alternatives considered**:
  - Collapse all non-success outcomes into one generic failure state.
    Rejected because it prevents meaningful debugging and user feedback.
  - Treat empty as success with no special metadata.
    Rejected because the UI still needs a dedicated empty-state copy path.
