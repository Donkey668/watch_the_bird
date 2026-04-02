# Implementation Plan: 识别页鸟影识别

**Branch**: `008-bird-image-identify` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-bird-image-identify/spec.md`

**Note**: This plan replaces the current identify-page placeholder guidance with
an upload-to-recognition flow for mobile portrait usage. Scope covers one image
upload Route Handler, one structured bird recognition response, one structured
encyclopedia summary response, and the identify-page UI states needed to render
preview, loading, success, unrecognized, partial, and failure outcomes.
Apache ECharts remains explicitly out of scope.

## Summary

Add a real bird-image recognition experience to the existing `识别` screen.
Users upload one local image, see an immediate in-page preview, then receive a
bird recognition result with simplified Chinese name, English name, and Latin
name, followed by a clean encyclopedia summary. The frontend continues to live
inside the mobile shell and calls a dedicated App Router Route Handler. The
backend orchestrates the user-required DashScope-compatible OpenAI SDK flow
with `qwen3.6-plus` through `openai.chat.completions.create`, sends multimodal
`messages` content that includes `image_url` plus prompt text, uses structured
JSON outputs so the frontend can render the response directly, and returns a
fixed Chinese message when no recognizable bird is present. Weather lookup
requirements remain `N/A` for this feature slice.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.1 / React 19.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, existing
shadcn/ui primitives (`Button`, `Card`, `Input`, `Separator`, `Textarea`,
`Dialog` when needed), DashScope-compatible OpenAI SDK via the `openai`
package using `qwen3.6-plus` and `openai.chat.completions.create`; `openai` is currently missing from
`package.json` and must be installed before implementation  
**Storage**: No persistent storage; uploaded images are processed
ephemerally per request, frontend preview stays client-local, and the server
returns normalized recognition data only  
**Testing**: ESLint, `npx tsc --noEmit`, `npm run build`, and focused manual
validation of upload preview, latest-upload-wins behavior, no-bird messaging,
partial encyclopedia failure, and portrait mobile layout  
**Target Platform**: Modern mobile web browsers in portrait mode and the
Next.js Node.js server runtime  
**Project Type**: Next.js full-stack web application  
**Performance Goals**: Local preview visible within 1 second of file selection;
recognition state feedback visible immediately after upload; valid recognition
result or terminal unrecognized/failure state visible within 15 seconds in
normal network conditions; no horizontal overflow from 375px to 430px widths  
**Constraints**: Backend interfaces MUST use `app/api/**/route.ts`; frontend
components MUST use Tailwind CSS + shadcn/ui; charts MUST use Apache ECharts
when present, but this feature is `N/A`; user-facing product copy MUST default
to Simplified Chinese; LLM access MUST use the DashScope-compatible OpenAI SDK
with `DASHSCOPE_API_KEY` from `.env`; model calls MUST follow the
`openai.chat.completions.create` multimodal pattern with `messages` content
containing `image_url` and `text`; model outputs SHOULD use
`response_format: { "type": "json_object" }` so the frontend can render
normalized objects directly; the fixed no-bird message MUST be
`图片中未包含可识别的鸟类！`; AMap weather-query rules are `N/A` for this feature  
**Scale/Scope**: 1 identify-page flow, 1 new recognition endpoint, 1 current
screen placeholder replacement, 2 server-side model stages (recognition and
encyclopedia), and 5 user-visible states (`empty`, `loading`, `success`,
`partial`, `unrecognized/failed`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design gate**: PASS

- [x] All backend capabilities exposed to the frontend are mapped to an App
      Router Route Handler under `app/api/**/route.ts`.
- [x] Frontend identify-page components are planned to call only the approved
      Route Handler and will not bypass the API boundary.
- [x] Reusable UI remains Tailwind CSS + shadcn/ui based; no second component
      system is introduced.
- [x] User-facing copy, placeholders, loading text, error text, and no-bird
      messaging remain Simplified Chinese.
- [x] Any data visualization uses Apache ECharts and defines loading, empty,
      error, and responsive states. This feature is `N/A`.
- [x] Missing dependencies that block a more efficient implementation path are
      identified early and surfaced before fallback decisions. The `openai`
      package is currently absent and is recorded as a required dependency.
- [x] No exception is required before planning.

**Post-design re-check**: PASS

- [x] `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`
      consistently keep all frontend-facing recognition data behind the Route
      Handler boundary.
- [x] The design keeps all identify functionality inside the existing mobile
      shell and `识别` screen instead of introducing a separate route.
- [x] All visible copy in upload, loading, success, unrecognized, partial, and
      failure states stays in Simplified Chinese except bird-name content that
      is intentionally English or Latin by domain definition.
- [x] Contract artifacts explicitly mark chart scope as `N/A`.
- [x] The dependency gap for `openai` remains documented instead of silently
      replaced by a weaker fallback path.

## Project Structure

### Documentation (this feature)

```text
specs/008-bird-image-identify/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- bird-identify-api-contract.md
|   `-- identify-screen-ui-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- api/
|   `-- identify/
|       `-- bird-recognition/
|           `-- route.ts
`-- _components/
    |-- identify-screen.tsx
    |-- identify-upload-card.tsx
    |-- identify-result-card.tsx
    `-- identify-encyclopedia-card.tsx
components/
`-- ui/
    |-- button.tsx
    |-- card.tsx
    |-- input.tsx
    `-- separator.tsx
lib/
|-- ai/
|   `-- dashscope-client.ts
`-- identify/
    |-- bird-encyclopedia.ts
    |-- bird-recognition.ts
    |-- image-upload.ts
    `-- identify-contract.ts
scripts/
`-- verify-identify-env.mjs
```

**Structure Decision**: Keep the frontend identify experience inside
`app/_components/identify-screen.tsx`, but split upload, recognition-result,
and encyclopedia rendering into focused local components so each state remains
simple to reason about. Add one dedicated Route Handler at
`app/api/identify/bird-recognition/route.ts` to accept the uploaded image and
return the normalized response. Centralize DashScope/OpenAI client creation in
`lib/ai/dashscope-client.ts`, keep prompt assembly plus response normalization
in `lib/identify/`, and add a feature-specific env verifier because the
existing `verify-amap-env.mjs` script is weather-focused.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
