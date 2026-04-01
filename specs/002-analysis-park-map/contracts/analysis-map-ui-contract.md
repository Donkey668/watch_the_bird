# UI Contract: Analysis Screen Park Map Selector

## Route Surface

- **Route**: `/`
- **Primary container**: Analysis screen within the existing mobile shell
- **Public contract type**: Client-side UI interaction contract

## Layout Contract

- A dedicated map block is rendered directly under the fixed top navigation bar
  inside the analysis screen content area.
- The map surface is horizontally presented and fits available viewport width.
- The map block must not introduce horizontal scrolling in target mobile widths.

## Park Selector Contract

| Position | Control Type | Required Options |
|----------|--------------|------------------|
| Top-right of map frame | Dropdown selector | `Shenzhen Bay Park`, `Shenzhen East Lake Park`, `Bijia Mountain Park`, `Fairy Lake Botanical Garden` |

### Required behavior

- Selector is visible whenever map block is visible.
- Selector has a default selected park on first load.
- Selecting a new park updates active selection immediately.

## Map Interaction Contract

### Initial state

- Map initializes with one default park centered.
- Exactly one marker is visible at initial park location.

### Park switch behavior

- Selecting a park re-centers map to that park.
- Marker updates to the selected park location.
- Previous marker state is replaced, not duplicated.
- Interaction completes without full page refresh.

### Rapid input behavior

- If user selects parks repeatedly in quick succession, final rendered state
  must match the last selection.

## Fallback and Error Contract

- If map rendering becomes unavailable, user sees a clear message.
- Selector remains visible and usable during temporary map unavailability.
- A retry path must be available when runtime configuration is valid but the
  initial map load fails.
- Once map becomes available again, center and marker realign with the current
  selector value.

## Out-of-Scope Contract Notes

- No backend API contract is introduced in this feature.
- No persistence contract is defined for remembering selected park across
  sessions.
- No chart rendering contract is defined in this feature slice.
