export type InterpolationMethod = 'nearest' | 'bilinear'

export type InterpolationInfo = {
  label: string
  description: string
  resize: (source: ImageData, targetWidth: number, targetHeight: number) => ImageData
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function readPixel(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
): [number, number, number, number] {
  const index = (y * width + x) * 4
  return [data[index], data[index + 1], data[index + 2], data[index + 3]]
}

function writePixel(
  data: Uint8ClampedArray,
  offset: number,
  rgba: [number, number, number, number],
): void {
  data[offset] = rgba[0]
  data[offset + 1] = rgba[1]
  data[offset + 2] = rgba[2]
  data[offset + 3] = rgba[3]
}

function mapCoordinate(
  targetCoord: number,
  targetSize: number,
  sourceSize: number,
): number {
  if (targetSize <= 1) {
    return 0
  }
  if (sourceSize <= 1) {
    return 0
  }
  return (targetCoord * (sourceSize - 1)) / (targetSize - 1)
}

export function resizeNearestNeighbor(
  source: ImageData,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  const output = new ImageData(targetWidth, targetHeight)
  const src = source.data
  const dst = output.data
  const srcW = source.width
  const srcH = source.height

  for (let y = 0; y < targetHeight; y += 1) {
    const srcY = Math.round(mapCoordinate(y, targetHeight, srcH))
    for (let x = 0; x < targetWidth; x += 1) {
      const srcX = Math.round(mapCoordinate(x, targetWidth, srcW))
      const rgba = readPixel(src, srcW, srcX, srcY)
      writePixel(dst, (y * targetWidth + x) * 4, rgba)
    }
  }

  return output
}

export function resizeBilinear(
  source: ImageData,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  const output = new ImageData(targetWidth, targetHeight)
  const src = source.data
  const dst = output.data
  const srcW = source.width
  const srcH = source.height

  for (let y = 0; y < targetHeight; y += 1) {
    const srcY = mapCoordinate(y, targetHeight, srcH)
    const y0 = Math.floor(srcY)
    const y1 = Math.min(srcH - 1, y0 + 1)
    const fy = srcY - y0

    for (let x = 0; x < targetWidth; x += 1) {
      const srcX = mapCoordinate(x, targetWidth, srcW)
      const x0 = Math.floor(srcX)
      const x1 = Math.min(srcW - 1, x0 + 1)
      const fx = srcX - x0

      const c00 = readPixel(src, srcW, x0, y0)
      const c10 = readPixel(src, srcW, x1, y0)
      const c01 = readPixel(src, srcW, x0, y1)
      const c11 = readPixel(src, srcW, x1, y1)

      const rgba: [number, number, number, number] = [0, 0, 0, 0]
      for (let channel = 0; channel < 4; channel += 1) {
        const top = c00[channel] * (1 - fx) + c10[channel] * fx
        const bottom = c01[channel] * (1 - fx) + c11[channel] * fx
        rgba[channel] = clampByte(top * (1 - fy) + bottom * fy)
      }

      writePixel(dst, (y * targetWidth + x) * 4, rgba)
    }
  }

  return output
}

export const INTERPOLATION_METHODS: Record<
  InterpolationMethod,
  InterpolationInfo
> = {
  nearest: {
    label: 'Ближайший сосед',
    description:
      'Каждый пиксель берётся из ближайшего исходного. Подходит для пиксель-арта, но даёт «зубчатые» края на фото.',
    resize: resizeNearestNeighbor,
  },
  bilinear: {
    label: 'Билинейная',
    description:
      'Значение вычисляется по четырём соседним пикселям. Даёт более мягкие переходы и обычно лучше для фотографий.',
    resize: resizeBilinear,
  },
}

export const DEFAULT_INTERPOLATION: InterpolationMethod = 'bilinear'

export function resizeImageData(
  source: ImageData,
  targetWidth: number,
  targetHeight: number,
  method: InterpolationMethod = DEFAULT_INTERPOLATION,
): ImageData {
  const width = Math.max(1, Math.round(targetWidth))
  const height = Math.max(1, Math.round(targetHeight))

  if (width === source.width && height === source.height) {
    return new ImageData(new Uint8ClampedArray(source.data), width, height)
  }

  return INTERPOLATION_METHODS[method].resize(source, width, height)
}

export function megapixels(width: number, height: number): number {
  return (width * height) / 1_000_000
}
