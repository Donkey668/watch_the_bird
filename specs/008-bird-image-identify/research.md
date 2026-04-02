# Research: 识别页鸟影识别

## Decision 1: Use one orchestration Route Handler for the whole identify flow

- **Decision**: Add `POST /api/identify/bird-recognition` as the only
  frontend-facing backend contract for this feature slice.
- **Rationale**: The identify screen needs one upload action that leads to one
  latest-upload-wins result context. A single Route Handler keeps the frontend
  simple and makes it easier to align preview, loading, success, partial,
  unrecognized, and failure states to the latest selected image.
- **Alternatives considered**:
  - Separate recognition and encyclopedia into two frontend-called endpoints.
    Rejected because it adds extra client orchestration and increases stale
    result risk during rapid re-uploads.
  - Perform model calls directly from the client.
    Rejected because it violates the Route Handler boundary and would expose
    server-only credentials.

## Decision 2: Keep image uploads ephemeral and preview client-local

- **Decision**: Handle the selected image as a client-local preview plus one
  transient server request payload, without persisting the original file.
- **Rationale**: The feature only needs immediate recognition for the current
  image and does not require a gallery or server-side asset history. Client-side
  preview keeps the UI responsive, while ephemeral server handling avoids
  unnecessary storage design.
- **Alternatives considered**:
  - Persist uploaded files on the server.
    Rejected because the current scope has no retrieval or reuse requirement.
  - Persist previews in browser storage.
    Rejected because the feature only needs the current-screen session state.

## Decision 3: Use DashScope-compatible OpenAI chat completions with multimodal image input

- **Decision**: Use the `openai` SDK against
  `https://dashscope.aliyuncs.com/compatible-mode/v1`, call `qwen3.6-plus`
  through `openai.chat.completions.create`, send one user message whose
  `content` contains both `image_url` and `text`, and require
  `response_format: { "type": "json_object" }` for the model data that drives
  frontend rendering.
- **Rationale**: The user explicitly requested the OpenAI SDK style and JSON
  output suitable for direct rendering, and later clarified the exact example
  shape to use. Structured outputs reduce brittle text parsing and make
  partial success handling more predictable.
- **Alternatives considered**:
  - Free-form text responses from the model.
    Rejected because the frontend would need fragile string parsing.
  - Local heuristic recognition.
    Rejected because the user explicitly requested the model path for this
    feature.

## Decision 4: Keep recognition and encyclopedia as two server-side model stages

- **Decision**: Run recognition first, then run the encyclopedia prompt only
  when a recognizable bird result exists.
- **Rationale**: The encyclopedia prompt depends on the recognized species
  identity. Separating the stages allows the backend to return a stable
  `unrecognized` state early, while still supporting a `partial` state when
  recognition succeeds but encyclopedia generation fails.
- **Alternatives considered**:
  - Ask the model for recognition and encyclopedia in one large prompt.
    Rejected because it couples two different error conditions and makes the
    no-bird branch harder to control.
  - Always run encyclopedia generation even if no bird is recognized.
    Rejected because it wastes tokens and cannot produce a trustworthy result.

## Decision 5: Enforce a fixed no-bird message on the server

- **Decision**: Normalize all "no recognizable bird" outcomes to the exact
  message `图片中未包含可识别的鸟类！`.
- **Rationale**: The user explicitly clarified this wording. Server-side
  normalization prevents drift caused by varying model phrasing and ensures the
  frontend renders one consistent message.
- **Alternatives considered**:
  - Display the model's raw unrecognized explanation.
    Rejected because the user asked for a fixed message.
  - Treat no-bird as a generic failure.
    Rejected because the image request is valid and the UI should remain
    recoverable.

## Decision 6: Sanitize encyclopedia protection text after model output

- **Decision**: Ask the model for structured encyclopedia fields, then strip
  parentheses and recompose the final protection-level text server-side before
  returning it to the client.
- **Rationale**: The feature requires domestic protection and global threat
  levels to remain visible, but bracketed explanatory fragments must not be
  displayed. Server-side cleanup ensures the UI gets directly renderable text.
- **Alternatives considered**:
  - Trust the model to always omit parentheses correctly.
    Rejected because the output format would be less deterministic.
  - Return raw protection text and sanitize in the client.
    Rejected because normalization belongs behind the API boundary.

## Decision 7: Surface the missing `openai` dependency and keep weather rules out of scope

- **Decision**: Record `openai` as a required new dependency for implementation
  and explicitly mark the project's weather-query requirement as `N/A` for this
  feature slice.
- **Rationale**: The constitution requires dependency gaps to be surfaced
  before falling back. The user-required SDK path is blocked only because the
  dependency is not currently installed. The same planning discipline also
  avoids accidental scope creep from unrelated weather requirements.
- **Alternatives considered**:
  - Quietly reuse another HTTP client or a mock path instead of the OpenAI SDK.
    Rejected because it silently weakens the requested implementation path.
  - Pull weather logic into this feature because it exists elsewhere in the app.
    Rejected because this feature is identify-page local and does not use AMap
    weather data.

## Decision 8: Use direct chat-completions calls without extra tool invocations

- **Decision**: Keep both model stages as direct structured-output calls and do
  not enable `web_search`, `code_interpreter`, or `web_extractor` in the
  current feature scope.
- **Rationale**: This feature needs low-latency recognition and a clean
  directly renderable encyclopedia summary, not open-ended web retrieval or
  code execution. Avoiding extra tools keeps the `chat.completions.create`
  response shape predictable.
- **Alternatives considered**:
  - Enable web-search-style tools for encyclopedia generation.
    Rejected because it increases latency and makes structured UI rendering more
    variable for the current mobile flow.
  - Enable code-interpreter-style tools for image preprocessing.
    Rejected because the feature only requires one uploaded image plus direct
    model recognition, not analytical computation pipelines.
