# Data Model: Watch The Bird Mobile Web Experience

## Overview

This feature does not introduce persisted backend data. Its data model is a UI
state model that defines navigation state, view metadata, and orientation rules.

## Entities

### NavigationTab

**Purpose**: Represents one fixed button in the top navigation bar.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | enum | One of `analysis`, `identify`, or `records` |
| `label` | string | User-facing text shown in the top bar |
| `order` | integer | Visual order from left to right |
| `isActive` | boolean (derived) | Whether the tab matches the current active screen |
| `isDisabled` | boolean | Whether the tab is temporarily non-interactive during a guarded state |

**Validation rules**:

- Exactly three navigation tabs must exist.
- `id` values must be unique.
- `order` must be `0`, `1`, or `2`.
- At most one tab can be active at a time.

**Relationships**:

- One `NavigationTab` maps to exactly one `ScreenView`.

### ScreenView

**Purpose**: Represents a top-level content panel rendered below the fixed
navigation bar.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | enum | One of `analysis`, `identify`, or `records` |
| `title` | string | Visible section heading |
| `summary` | string | Introductory or empty-state copy |
| `contentState` | enum | `intro`, `active`, or `empty` |
| `transitionState` | enum | `idle`, `entering`, or `exiting` |
| `scrollMode` | enum | `vertical-only` for this feature |
| `requiresPortrait` | boolean | Whether the screen should be hidden by the landscape prompt |

**Validation rules**:

- A `ScreenView` must exist for every `NavigationTab`.
- `transitionState` can only be `entering` or `exiting` during a navigation
  change; otherwise it must be `idle`.
- `scrollMode` must stay `vertical-only` across all three screens.

**Relationships**:

- Each `ScreenView` is targeted by one `NavigationTab`.
- Each `ScreenView` is governed by the current `OrientationState`.

### OrientationState

**Purpose**: Represents whether the visitor can use the shell normally or must
be prompted to return to portrait mode.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `mode` | enum | `portrait` or `landscape` |
| `promptVisible` | boolean (derived) | Whether the rotate-back guidance is shown |
| `viewportWidth` | number | Current viewport width in pixels |
| `viewportHeight` | number | Current viewport height in pixels |
| `withinTargetRange` | boolean (derived) | Whether the width is within the recommended 375px to 430px range |

**Validation rules**:

- `promptVisible` must be `true` whenever `mode` is `landscape`.
- Portrait mode must allow normal shell interaction.
- Landscape mode must not expose a dedicated alternate layout.

## Derived State Rules

- `activeTabId` and `activeScreenId` must always match.
- When `OrientationState.mode = landscape`, the portrait guidance state takes
  precedence over screen interaction.
- A screen transition completes only when the outgoing screen leaves `exiting`
  and the incoming screen returns to `idle`.

## State Transitions

### Initial Load

1. `OrientationState.mode` is evaluated.
2. `activeTabId` is set to `analysis`.
3. `analysis` screen becomes visible with `transitionState = idle`.
4. `identify` and `records` remain inactive.

### Tab Switch

1. Visitor taps a different `NavigationTab`.
2. Current `ScreenView` enters `exiting`.
3. Target `ScreenView` enters `entering`.
4. Active tab and visible screen change together.
5. Both screens settle to `idle` once the transition completes.

### Landscape Rotation

1. `OrientationState.mode` changes to `landscape`.
2. `promptVisible` becomes `true`.
3. The shell stops presenting a normal landscape experience.
4. When portrait mode returns, the prompt disappears and the last active screen
   is restored.
