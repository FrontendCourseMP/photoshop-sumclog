export const VIEW_SCALE_MIN = 12
export const VIEW_SCALE_MAX = 300
export const VIEW_PADDING = 50

export function clampViewScale(percent: number): number {
  return Math.max(VIEW_SCALE_MIN, Math.min(VIEW_SCALE_MAX, percent))
}

export function fitScale(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number,
): number {
  if (imageWidth <= 0 || imageHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return 1
  }

  return Math.min(maxWidth / imageWidth, maxHeight / imageHeight)
}

export function computeInitialViewScalePercent(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const maxWidth = Math.max(1, viewportWidth - VIEW_PADDING * 2)
  const maxHeight = Math.max(1, viewportHeight - VIEW_PADDING * 2)
  const scale = fitScale(imageWidth, imageHeight, maxWidth, maxHeight)
  return clampViewScale(scale * 100)
}
