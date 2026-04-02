# UI Contract: Analysis Weather and Birding Outlook

## Route Surface

- **Route**: `/`
- **Primary container**: Analysis screen within the existing mobile shell
- **Panel position**: Immediately below the existing analysis map panel

## Layout Contract

- The weather and birding outlook panel is rendered as a full-width content
  block inside the analysis screen flow.
- The panel must align with the same content width constraints used by the map
  and other analysis cards.
- The panel must not introduce horizontal scrolling at target portrait widths.

## Content Contract

### Required sections

| Section | Required Content |
|---------|------------------|
| Header | Panel title plus the current district context |
| Birding index highlight | One value only from the supported birding-index enum when available |
| Weather details | All normalized weather fields returned for rendering |
| Status messaging | Loading, partial failure, or full failure explanation |

### Required behavior

- The panel loads automatically for the default map park.
- The panel refreshes automatically when the selected park changes.
- The panel result must always match the latest selected park.
- During refresh, the panel must not present stale birding-index text as if it belongs to the new park selection.
- The frontend must never assume birding index is LLM-generated; it only renders the normalized backend result.

## State Contract

### Loading state

- Show a lightweight loading indicator or placeholder below the map.
- Keep the previously requested result hidden while the latest request is in flight.

### Success state

- Highlight the birding index visually above or ahead of the weather field list.
- Show district name and all weather values returned by the normalized response.
- Successful birding index values remain limited to `适宜` / `较适宜` / `不适宜`.

### Partial success state

- Continue showing weather details.
- Replace the birding index value with an unavailable label and explanation.
- Use this state when the local algorithm cannot score the current weather snapshot.
- Keep retry action scoped to the outlook panel only.

### Failure state

- Show a clear non-blocking error message in the panel area.
- Keep the map and park selector available above the panel.
- If a retry affordance is provided, it must trigger panel refresh only.

## Out-of-Scope Contract Notes

- No new top-level tab or route is introduced.
- No chart surface is introduced for this feature.
- No historical weather timeline or multi-day forecast comparison is required in this slice.
