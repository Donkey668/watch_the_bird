# Quickstart: Analysis Weather and Birding Index

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing mobile shell and analysis map feature already implemented
- AMap Web JS key, security code, and weather key configured locally

## Environment Setup

Update local environment values before running the feature:

```bash
NEXT_PUBLIC_AMAP_KEY=<your-amap-web-key>
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=<your-amap-security-js-code>
AMAP_WEATHER_KEY=<required-amap-weather-key>
```

Implementation notes:

- `AMAP_WEATHER_KEY` is used by the server Route Handler when composing the
  AMap weather URL.
- No LLM-specific environment variables are required anymore.
- The frontend must never read `AMAP_WEATHER_KEY` directly.

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
3. Confirm the weather and birding-index block appears directly below the map.
4. Confirm the default park automatically triggers a panel load.
5. Confirm the panel shows district weather details and one supported index from `适宜` / `较适宜` / `不适宜`.
6. Switch to each preset park and confirm the panel refreshes without full-page reload.
7. Confirm the district label and weather details change with the selected park.
8. Confirm the final rendered result matches the last selected park after rapid switching.
9. Temporarily break weather access and confirm the panel shows a weather-unavailable state without blocking map interaction.
10. Temporarily simulate an unsupported weather phenomenon or unparsable wind / temperature / humidity value and confirm weather remains visible while birding index becomes unavailable.
11. Inspect browser network activity and confirm the frontend calls only `/api/analysis/birding-outlook?...`.

## Implementation Notes

- The Route Handler composes the AMap weather URL as a GET request and parses JSON.
- The server computes birding index locally instead of calling QWen or any other LLM.
- Weighted scoring is `天气 40% + 风力 20% + 温度 20% + 湿度 20%`.
- Final score is rounded to the nearest integer and mapped to `适宜` / `较适宜` / `不适宜`.
- Unsupported weather text or unparsable required values produce a partial-success response.
- The panel reuses Tailwind CSS + shadcn/ui primitives and remains scoped to the analysis screen.

## Validation Status

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed.
- `npm run amap:verify-env`: should pass when the AMap-related env values are configured.
- Full manual UI validation is still pending against live upstream weather responses.
