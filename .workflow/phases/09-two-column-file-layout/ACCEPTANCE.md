# Phase 09 Acceptance Criteria

## Functional Requirements

- [x] ToolFileUpload exposes `triggerSelect()` method
- [x] ToolFilePanel has correct button layout: LEFT=[导入文件][粘贴], RIGHT=[复制][导出文件]
- [x] All 45 tool files updated with new layout
- [x] Copy/export buttons always visible, disabled when no result
- [x] Import button triggers file selection dialog
- [x] Paste button triggers clipboard read

## Output File Display (FileCard)

- [x] All file-output tools use FileCard for right-column output display
- [x] FileCard shows 128x128 thumbnail + filename, clickable for preview
- [x] No delete button on output FileCards (removable=false)
- [x] 5 audio tools updated (audio-extract, audio-change-speed, audio-trim, audio-loop, audio-converter)
- [x] 13 image tools updated (convert-to-jpg, convert-to-webp, image-change-colors, image-change-opacity, image-compress, image-create-transparent, image-flip, image-resize, image-rotate, image-split, image-watermark, images-to-gif, jpg-to-png)
- [x] 11 video tools updated (video-add-audio, video-change-speed, video-compress, video-crop, video-flip, video-loop, video-merge, video-resize, video-rotate, video-to-gif, video-trim)
- [x] 3 PDF multi-output tools updated (pdf-extract-images, pdf-to-png, pdf-to-epub)
- [x] 6 custom layout tools updated (qr-code-generator, wifi-qr-code-generator, screenshot-share, svg-placeholder-generator, camera-recorder, gif-change-speed)
- [x] 3 PDF single-output tools updated (convert-to-pdf, pdf-editor, pdf-merge, pdf-protect, pdf-rotate, pdf-split)
- [x] Editable canvas tools NOT converted (image-crop, image-editor, image-remove-background)

## Canvas Tool Display Fixes

- [x] Canvas overflow contained with max-width:100% and overflow:auto
- [x] ImageRemoveBackground shows only processed image (not original underneath)
- [x] CSS checkerboard background shows through transparent areas

## Technical Requirements

- [x] Type check passes
- [x] Build passes
- [x] All tests pass
- [x] No regression in existing functionality

## Manual Testing

- [x] Verify button positions in browser (LEFT=[导入文件][粘贴文件], RIGHT=[复制文件][导出文件])
- [x] Test import button triggers file dialog
- [x] Test paste button reads clipboard
- [x] Test copy button disabled state
- [x] Test export button disabled state
- [x] Verify compact upload trigger layout (in grid alongside imported files)
- [x] Verify FileCard output display across tool categories
- [x] Verify canvas tools display correctly without overflow
