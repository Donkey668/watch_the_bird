# Quickstart: 识别页鸟影识别

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing mobile shell and `识别` screen already render successfully
- `DASHSCOPE_API_KEY` configured in local `.env`

## Dependency Readiness

- This feature requires the `openai` package for the user-specified
  DashScope-compatible `chat.completions.create` SDK path.
- The dependency is currently not present in `package.json`.
- Install it before implementation or local verification:

```bash
npm install openai
```

## Environment Setup

Ensure the following server-only variable exists in local `.env`:

```bash
DASHSCOPE_API_KEY=<your-dashscope-api-key>
```

Implementation notes:

- `DASHSCOPE_API_KEY` must never be read directly by frontend code.
- The identify Route Handler should read it on the server only.
- Weather-related environment variables are not required for this feature.

## Run The App

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and enable mobile emulation.

## Recommended Viewports

- 375 x 812
- 390 x 844
- 412 x 915
- 430 x 932

## Manual Validation Flow

1. Open `/` and keep portrait mode enabled.
2. Switch to the `识别` screen.
3. Confirm the small header label displays `鸟影识别`.
4. Confirm the main title still displays `鸟类识别工具`.
5. Confirm the old placeholder guidance content is replaced by a 4:3 upload
   frame.
6. Confirm the empty upload frame shows a camera icon and `点击上传图片`.
7. Upload one valid local bird image and confirm the preview appears
   immediately.
8. Confirm the page shows `识别中......` while the request is in flight.
9. Confirm a successful response shows Chinese, English, and Latin species
   names.
10. Confirm the encyclopedia area appears below the recognition result and
    includes `物种特征`、`生活习性`、`分布区域`、`保护级别`.
11. Confirm protection text does not display parenthetical content.
12. Upload an image with no recognizable bird and confirm the page shows
    `图片中未包含可识别的鸟类！`.
13. Simulate encyclopedia failure after successful recognition and confirm the
    recognition area remains visible while the encyclopedia area shows fallback
    messaging only.
14. Upload a second image before the first request completes and confirm only
    the newest image can update the visible result.
15. Confirm the bottom note `识别结果仅供参考。鸟类图片越接近标准照，准确率越高。`
    remains visible and the screen never introduces horizontal overflow.

## Validation Status

- Planning stage only: implementation validation is still pending.

## Implementation Notes

- Keep all model calls behind `POST /api/identify/bird-recognition`.
- Use the DashScope-compatible OpenAI SDK with `qwen3.6-plus`.
- Use `openai.chat.completions.create` with multimodal `messages` content that
  includes `image_url` and `text`.
- Prefer structured JSON outputs so the frontend can render normalized objects
  directly.
- Normalize no-bird outcomes to `图片中未包含可识别的鸟类！`.
- Keep chart scope as `N/A`.
