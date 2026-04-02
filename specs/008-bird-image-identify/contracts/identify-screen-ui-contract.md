# UI Contract: Identify Screen Bird Image Recognition

## Route Surface

- **Route**: `/`
- **Primary container**: Existing `识别` screen inside the mobile shell
- **Panel position**: Inside the identify screen content area, below the header

## Layout Contract

- Keep the existing mobile-shell placement and fixed top navigation unchanged.
- Replace the current identify-page placeholder card stack with a real upload,
  recognition, and encyclopedia flow.
- The top small label must display `鸟影识别`.
- The main title must remain `鸟类识别工具`.
- The image-upload frame must render in a horizontal 4:3 ratio and match the
  identify screen content width.
- The entire identify screen must fit portrait widths from 375px to 430px
  without horizontal scrolling.

## Content Contract

### Required visible content

| Section | Required Content |
|---------|------------------|
| Header | `鸟影识别` and `鸟类识别工具` |
| Upload frame empty state | Camera icon plus `点击上传图片` |
| Loading state | Centered `识别中......` |
| Recognition result | Simplified Chinese name, English name, Latin name |
| Encyclopedia area | Structured text covering `物种特征`、`生活习性`、`分布区域`、`保护级别` |
| Bottom note | `识别结果仅供参考。鸟类图片越接近标准照，准确率越高。` |

### Explicit exclusions

- Do not keep the old identify placeholder steps as the primary page content.
- Do not show raw model JSON, raw tool traces, or raw prompt text to users.
- Do not display parenthetical content inside protection-level text.
- Do not introduce chart content for this feature.

## State Contract

### Empty state

- Show the 4:3 upload frame with a centered camera icon and `点击上传图片`.
- Keep the bottom note visible.

### Preview state

- Show the selected image preview immediately after local file selection.
- Keep image proportions intact with no stretching.

### Loading state

- Keep the latest selected image preview visible.
- Show a centered `识别中......` state below the image frame.
- Do not continue showing prior bird-name or encyclopedia content as if it
  belonged to the new upload.

### Success state

- Show all three species names in the recognition area.
- Show all required encyclopedia sections below the recognition area.
- Keep all surrounding UI copy in Simplified Chinese.

### Partial success state

- Keep the recognition result visible.
- Show a clear Chinese fallback in the encyclopedia area only.
- Do not clear the recognition area when only the encyclopedia stage fails.

### Unrecognized state

- Keep the latest image preview visible.
- Show the exact message `图片中未包含可识别的鸟类！`.
- Do not render stale recognition names or encyclopedia text from an earlier
  upload.

### Failure state

- Keep the upload entry available for retry.
- Show a clear Chinese failure message in the result area.
- Keep the bottom note visible.

## Interaction Contract

- Tapping the upload frame opens local image selection.
- Selecting a new image replaces the previous preview and invalidates the
  previous result context immediately.
- The identify screen must apply a latest-upload-wins rule if multiple uploads
  occur close together.
- The user never needs to navigate away from the identify screen to retry.
