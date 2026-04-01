# Quickstart: Watch The Bird Mobile Web Experience

## Prerequisites

- Node.js 20+ installed
- npm available

## Run The App

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser and use mobile device emulation.

## Recommended Viewports

- 375 x 812
- 390 x 844
- 412 x 915
- 430 x 932

## Manual Validation Flow

1. Load the home page in portrait mode.
2. Confirm the page opens on the birdwatching index analysis screen.
3. Confirm the top bar stays fixed while the content area scrolls vertically.
4. Confirm the left tab is active on first load and the other two are inactive.
5. Tap the center tab and confirm the bird identification tool screen appears
   without a full page refresh.
6. Confirm the center tab becomes active and a fade or slide transition is
   visible.
7. Tap the right tab and confirm the personal observation records screen appears
   without a full page refresh.
8. Confirm the right tab becomes active and the top bar remains fixed.
9. Check that no horizontal scrolling is required in the recommended portrait
   widths.
10. Rotate the viewport to landscape and confirm the product does not present a
    dedicated landscape layout and instead asks the user to return to portrait.

## Implementation Notes For This Feature

- Use Tailwind CSS for layout, spacing, typography, and motion utilities.
- Use shadcn/ui components wherever a matching primitive is available, especially
  for buttons and surface containers.
- Keep the interactive client boundary local to the mobile shell component.
- Do not add backend APIs, persistence, or chart implementations in this slice.

## Implementation Validation Log (2026-03-31)

- `npm run lint`: PASS
- `npm run build`: PASS
- Manual viewport walkthrough in a browser emulator is still required to verify
  interactive behavior at 375x812, 390x844, 412x915, and 430x932 plus
  landscape-rotation guidance.
