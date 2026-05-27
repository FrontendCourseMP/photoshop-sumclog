export const FULL_HD = { width: 1920, height: 1080 } as const

export function fitScale(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number,
): number {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return 1
  }

  return Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1)
}

export function fitScaleToFullHd(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const maxWidth = Math.min(FULL_HD.width, viewportWidth)
  const maxHeight = Math.min(FULL_HD.height, viewportHeight)
  return fitScale(imageWidth, imageHeight, maxWidth, maxHeight)
}
