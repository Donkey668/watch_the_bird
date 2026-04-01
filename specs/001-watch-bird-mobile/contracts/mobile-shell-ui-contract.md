# UI Contract: Watch The Bird Mobile Shell

## Route Surface

- **Route**: `/`
- **Primary audience**: Mobile visitors using the app in portrait orientation
- **Public contract type**: Client-side UI contract

## Fixed Top Navigation Contract

| Position | Tab ID | Label Intent | Default State | Target Screen |
|----------|--------|--------------|---------------|---------------|
| Left | `analysis` | Birdwatching index analysis | Active on first load | Analysis screen |
| Center | `identify` | Bird identification tool | Inactive on first load | Identify screen |
| Right | `records` | Personal observation records | Inactive on first load | Records screen |

### Required behavior

- The top bar remains fixed at the top of the viewport during vertical scroll.
- The top bar height is approximately 50px.
- The three tabs share available width evenly.
- Active state and visible screen always change together.

## Screen Contract

| Screen ID | Must Show | Empty or Introductory Requirement | Scroll Rule |
|-----------|-----------|-----------------------------------|-------------|
| `analysis` | Analysis title and shell content | Must show analysis intro state when detailed data is absent | Vertical only |
| `identify` | Tool title and shell content | Must show identification intro state before user input exists | Vertical only |
| `records` | Records title and shell content | Must show records intro or empty state when no records exist | Vertical only |

## Navigation Interaction Contract

### Initial state

- The visitor enters on `analysis`.
- The left tab is active.
- No full page refresh occurs after the first load.

### Tab switch behavior

- Tapping a tab swaps the content area to the matching screen.
- The newly selected tab becomes active immediately.
- The previously active tab becomes inactive.
- The content switch includes a simple fade, slide, or combined fade/slide
  transition.

### Rapid input behavior

- If multiple tabs are tapped quickly, the final tap determines the visible
  screen and active state.

## Orientation Contract

- Portrait mode is the supported viewing mode.
- Landscape mode does not receive a dedicated alternate layout.
- When landscape mode is detected, the interface shows guidance to return to
  portrait orientation.

## Out-of-Scope Contract Notes

- No backend API contract is defined for this feature.
- No persistence behavior is defined for selected tab state or user records.
- No chart rendering contract is defined in this feature slice.
