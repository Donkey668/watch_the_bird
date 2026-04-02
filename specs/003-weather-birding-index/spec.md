# Feature Specification: Analysis Weather and Birding Index

**Feature Branch**: `003-weather-birding-index`  
**Created**: 2026-03-31  
**Updated**: 2026-04-02  
**Status**: Implemented  
**Input**: Analysis page weather and birding index panel below the park map

## Summary

Add a weather and birding-index block below the analysis map. The backend must
query AMap district weather by the currently selected preset park, normalize the
returned weather payload, and compute today's birding index with a fixed local
scoring algorithm. The frontend continues to request one Route Handler and must
not call upstream weather services directly.

## User Scenarios & Testing

### User Story 1 - View The Current Park Outlook (Priority: P1)

As a user on the analysis screen, I want to see the selected park's current
weather and today's birding index directly below the map so I can quickly judge
whether birding is suitable today.

**Independent Test**: Open `/` on a portrait mobile viewport and confirm the
default park automatically loads district weather details plus one index level
from `适宜` / `较适宜` / `不适宜`.

### User Story 2 - Refresh Results When Switching Parks (Priority: P2)

As a user comparing parks, I want the weather and birding index block to refresh
when I switch the selected park so the displayed result always matches the map
selection.

**Independent Test**: Switch across all preset parks and confirm the panel
refreshes without full-page reload and always matches the final selected park.

### User Story 3 - Stay Clear Under Failures Or Unsupported Inputs (Priority: P3)

As a user, I want clear fallback states when weather data fails or when the
local scoring algorithm cannot score the current payload, so I never confuse an
old or invalid result with the current park.

**Independent Test**: Simulate weather failure and unsupported scoring input;
confirm the panel either shows a full failure state or keeps weather visible
while marking the birding index unavailable.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST render a dedicated `天气与观鸟指数` panel below the analysis map.
- **FR-002**: The system MUST use the map's current preset `parkId` as the only outlook context.
- **FR-003**: The backend MUST map the selected park to district-level weather lookup metadata.
- **FR-004**: The backend MUST request AMap weather through a composed `GET` URL and parse JSON.
- **FR-005**: The backend MUST compute the birding index locally and MUST NOT call any LLM service for this feature.
- **FR-006**: The birding index result MUST stay limited to `适宜` / `较适宜` / `不适宜`.
- **FR-007**: The frontend MUST display the normalized weather details returned by the Route Handler.
- **FR-008**: Park switching MUST automatically trigger a fresh weather-and-index request.
- **FR-009**: The frontend MUST call only `GET /api/analysis/birding-outlook?parkId=...`.
- **FR-010**: Loading, partial, and failure states MUST not display stale birding-index text for a previous park.
- **FR-011**: If weather lookup fails, the panel MUST show a clear failure state and omit the birding index.
- **FR-012**: If weather succeeds but any required scoring input is unsupported or unparsable, the panel MUST keep weather visible and mark the birding index unavailable.
- **FR-013**: The panel MUST stay width-safe on portrait mobile widths without horizontal scrolling.

### Local Scoring Rules

#### Final weighted score

- `观鸟指数总分 = 天气得分 × 40% + 风力得分 × 20% + 温度得分 × 20% + 湿度得分 × 20%`
- Final score uses `Math.round` style rounding to the nearest integer.
- Level mapping:
  - `80-100`: `适宜`
  - `60-79`: `较适宜`
  - `0-59`: `不适宜`

#### Weather score mapping

| Weather text | Score |
|---|---:|
| 晴 | 100 |
| 热 | 100 |
| 少云 | 98 |
| 晴间多云 | 95 |
| 多云 | 90 |
| 阴 | 75 |
| 轻雾 | 72 |
| 毛毛雨 / 细雨 | 68 |
| 阵雨 | 70 |
| 小雨 | 65 |
| 小雨-中雨 | 62 |
| 中雨 | 55 |
| 中雨-大雨 | 50 |
| 霾 | 55 |
| 中度霾 | 48 |
| 雾 | 52 |
| 浓雾 | 48 |
| 大雾 | 45 |
| 大雨 | 30 |
| 雷阵雨 | 25 |
| 雨 | 20 |
| 强阵雨 | 20 |
| 强雷阵雨 | 15 |
| 重度霾 | 10 |
| 强浓雾 | 10 |
| 暴雨 | 0 |
| 大暴雨 | 0 |
| 特大暴雨 | 0 |
| 大雨-暴雨 | 0 |
| 暴雨-大暴雨 | 0 |
| 大暴雨-特大暴雨 | 0 |
| 极端降雨 | 0 |
| 严重霾 | 0 |
| 特强浓雾 | 0 |

#### Wind score mapping

- `≤3级`: `100`
- `4级`: `75`
- `5级`: `70`
- `6级`: `55`
- `7级`: `45`
- `8级`: `30`
- `9级`: `20`
- `10级`: `10`
- `11级及以上`: `0`

#### Temperature score mapping

- `20℃-25℃`: `100`
- `15℃-19℃` or `26℃-30℃`: `75`
- `10℃-14℃` or `31℃-35℃`: `50`
- `<10℃` or `>35℃`: `20`

#### Humidity score mapping

- `40%-60%`: `100`
- `30%-39%` or `61%-70%`: `75`
- `<30%` or `71%-80%`: `50`
- `>80%`: `20`

### API Contract Summary

- **Route**: `GET /api/analysis/birding-outlook?parkId={parkId}`
- **Success payload**: park context + normalized weather + locally computed birding index
- **Partial payload**: weather is available, birding index is unavailable because a required local-scoring input cannot be used
- **Failure payload**: invalid park or unusable weather response

## Key Entities

- **ParkWeatherContext**: Selected preset park plus district lookup metadata.
- **DistrictWeatherSnapshot**: Normalized weather snapshot returned by AMap.
- **BirdingIndexAssessment**: Locally computed weighted-score result for the current weather snapshot.
- **BirdingOutlookResponse**: API response returned to the analysis panel.

## Assumptions

- Only preset parks are supported in this slice.
- All frontend access continues to go through App Router Route Handlers.
- The birding index depends only on the current weather snapshot and does not use any LLM or historical observation data.
- If AMap returns a weather phenomenon or field format outside the fixed scoring rules, the birding index is treated as unavailable instead of guessed.

## Success Criteria

- **SC-001**: In normal network conditions, the default park shows weather and birding index within 3 seconds.
- **SC-002**: Park switching refreshes the panel within 3 seconds in 95% of normal cases.
- **SC-003**: 100% of successful birding-index results remain within `适宜` / `较适宜` / `不适宜`.
- **SC-004**: The panel remains free of horizontal overflow on 375px-430px portrait widths.
- **SC-005**: After rapid switching, the final rendered result always matches the last selected park.
