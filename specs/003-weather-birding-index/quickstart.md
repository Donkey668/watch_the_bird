# Quickstart: Analysis Weather and Birding Index

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing mobile shell and analysis map feature already implemented
- DashScope-compatible API key available for server-side LLM access

## Environment Setup

Update local server-side environment values before running the feature:

```bash
NEXT_PUBLIC_AMAP_KEY=<your-amap-web-key>
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=<your-amap-security-js-code>
AMAP_WEATHER_KEY=<required-amap-weather-key>
DASHSCOPE_API_KEY=<your-dashscope-api-key>
BIRDING_INDEX_MODEL=qwen3.5-plus
```

Implementation notes for environment usage:

- `AMAP_WEATHER_KEY` is used by the server Route Handler when composing
  `https://restapi.amap.com/v3/weather/weatherInfo?...&key=...`.
- `DASHSCOPE_API_KEY` is used by the OpenAI SDK client on the server.
- `BIRDING_INDEX_MODEL` is optional at runtime; if omitted, the server falls
  back to `qwen3.5-plus`.
- The frontend must never read any of the server-only keys directly.

## Run The App

```bash
npm install
npm run amap:verify-env
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
2. Confirm the analysis screen still shows the map panel.
3. Confirm a new weather and birding outlook block appears directly below the map.
4. Confirm the default park automatically triggers a panel load.
5. Confirm the panel eventually shows district weather details and one supported
   birding index enum value.
6. Switch to each preset park and confirm the panel refreshes without full-page reload.
7. Confirm the district label and weather details change with the selected park.
8. Confirm the final rendered result matches the last selected park after rapid switching.
9. Temporarily break weather access and confirm the panel shows a weather
   unavailable state without blocking map interaction.
10. Restore weather access and temporarily break LLM access; confirm weather
    remains visible while the birding index becomes unavailable.
11. Inspect browser network activity and confirm the frontend calls only
    `/api/analysis/birding-outlook?...` rather than upstream weather or LLM
    services directly.

## Implementation Notes

- The route handler composes the AMap weather URL as a GET request and parses
  JSON response data.
- The LLM client uses the OpenAI SDK with the DashScope-compatible base URL.
- The LLM request uses `response_format: { type: "json_object" }`.
- The LLM system prompt explicitly constrains the result to
  `{ "birdingIndex": "<enum>" }`.
- The panel reuses Tailwind CSS + shadcn/ui primitives and remains scoped to
  the analysis screen.
- Map selection is lifted into `analysis-screen.tsx`, and the outlook panel is
  driven by the same `parkId` source of truth.

## Validation Status

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run amap:verify-env`: passed in the current local environment.
- Full manual UI validation is still pending until live upstream services are
  verified end-to-end.
