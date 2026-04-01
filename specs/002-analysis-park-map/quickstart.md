# Quickstart: Analysis Screen Park Map Selector

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing mobile shell feature already implemented
- AMap credentials available for local development

## Environment Setup

Create `.env.local` (or update your local environment source) with:

```bash
NEXT_PUBLIC_AMAP_KEY=<your-amap-web-key>
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=<your-amap-security-js-code>
```

Optional production-oriented fallback:

```bash
NEXT_PUBLIC_AMAP_SERVICE_HOST=https://your-proxy-domain.example.com/_AMapService
```

Use `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE` for local development and prefer
`NEXT_PUBLIC_AMAP_SERVICE_HOST` when you harden production delivery.

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
2. Confirm the analysis screen shows the map panel directly below the fixed top bar.
3. Confirm the map panel width adapts to the viewport and no horizontal scrolling appears.
4. Confirm the dropdown is visible at the map top-right corner.
5. Open the dropdown and verify the four options:
   `Shenzhen Bay Park`, `Shenzhen East Lake Park`, `Bijia Mountain Park`, and
   `Fairy Lake Botanical Garden`.
6. Select each park and confirm the map centers on the selected location.
7. Confirm exactly one marker is visible after each selection.
8. Rapidly change options and confirm the final map and marker state matches the last choice.
9. Confirm park switching does not trigger a page refresh or change the active top-level tab.
10. Temporarily remove a valid AMap key or block the network request and confirm
    fallback messaging appears while the dropdown remains visible.
11. Restore valid configuration, use the retry control, and confirm the map
    recovers to the currently selected park.

## Implementation Notes

- The map remains scoped to the analysis screen and does not add new routes.
- Tailwind CSS and shadcn/ui are used for the frame, card, button, and select UI.
- AMap security configuration must be resolved before the loader runs.
- The component keeps a single marker instance and updates it in place.
- No persistence is implemented for the last selected park.
