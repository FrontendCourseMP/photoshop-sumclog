import { cloneImageData } from './levels'

export type EdgePadding = 'black' | 'white' | 'replicate'

export type FilterChannelMask = {
  red: boolean
  green: boolean
  blue: boolean
  alpha: boolean
}

export type KernelPresetId =
  | 'identity'
  | 'sharpen'
  | 'gaussian'
  | 'boxBlur'
  | 'prewittX'
  | 'prewittY'

export type KernelPreset = {
  id: KernelPresetId
  label: string
  values: readonly [number, number, number, number, number, number, number, number, number]
}

export const KERNEL_PRESETS: KernelPreset[] = [
  {
    id: 'identity',
    label: 'Тождественное отображение',
    values: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  },
  {
    id: 'sharpen',
    label: 'Повышение резкости',
    values: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  },
  {
    id: 'gaussian',
    label: 'Фильтр Гаусса (3×3)',
    values: [
      1 / 16,
      2 / 16,
      1 / 16,
      2 / 16,
      4 / 16,
      2 / 16,
      1 / 16,
      2 / 16,
      1 / 16,
    ],
  },
  {
    id: 'boxBlur',
    label: 'Прямоугольное размытие',
    values: [
      1 / 9,
      1 / 9,
      1 / 9,
      1 / 9,
      1 / 9,
      1 / 9,
      1 / 9,
      1 / 9,
      1 / 9,
    ],
  },
  {
    id: 'prewittX',
    label: 'Оператор Прюитта (Gx)',
    values: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
  },
  {
    id: 'prewittY',
    label: 'Оператор Прюитта (Gy)',
    values: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
  },
]

export const DEFAULT_KERNEL = [...KERNEL_PRESETS[0].values] as number[]

const KERNEL_COMPARE_EPSILON = 1e-4

export function kernelsEqual(
  left: readonly number[],
  right: readonly number[],
  epsilon = KERNEL_COMPARE_EPSILON,
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => Math.abs(value - right[index]) <= epsilon)
  )
}

export function findMatchingPresetId(kernel: readonly number[]): KernelPresetId {
  const match = KERNEL_PRESETS.find((preset) => kernelsEqual(kernel, preset.values))
  return match?.id ?? 'identity'
}

const KERNEL_RADIUS = 1
const ROWS_PER_YIELD = 24

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function paddingFill(padding: EdgePadding): number {
  return padding === 'white' ? 255 : 0
}

function sampleChannel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  channelOffset: number,
  x: number,
  y: number,
  padding: EdgePadding,
): number {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    return data[(y * width + x) * 4 + channelOffset]
  }

  if (padding === 'replicate') {
    const clampedX = Math.max(0, Math.min(width - 1, x))
    const clampedY = Math.max(0, Math.min(height - 1, y))
    return data[(clampedY * width + clampedX) * 4 + channelOffset]
  }

  return paddingFill(padding)
}

function convolveAt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  channelOffset: number,
  x: number,
  y: number,
  kernel: readonly number[],
  padding: EdgePadding,
): number {
  let sum = 0
  let kernelIndex = 0

  for (let ky = -KERNEL_RADIUS; ky <= KERNEL_RADIUS; ky += 1) {
    for (let kx = -KERNEL_RADIUS; kx <= KERNEL_RADIUS; kx += 1) {
      const sample = sampleChannel(
        data,
        width,
        height,
        channelOffset,
        x + kx,
        y + ky,
        padding,
      )
      sum += kernel[kernelIndex] * sample
      kernelIndex += 1
    }
  }

  return clampByte(sum)
}

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0)
  })
}

export async function applyKernelConvolution(
  imageData: ImageData,
  kernel: readonly number[],
  padding: EdgePadding,
  channels: FilterChannelMask,
  options?: {
    onProgress?: (progress: number) => void
    signal?: AbortSignal
  },
): Promise<ImageData> {
  const output = cloneImageData(imageData)
  const src = imageData.data
  const dst = output.data
  const { width, height } = imageData

  const channelPlan: { offset: number; enabled: boolean }[] = [
    { offset: 0, enabled: channels.red },
    { offset: 1, enabled: channels.green },
    { offset: 2, enabled: channels.blue },
    { offset: 3, enabled: channels.alpha },
  ]

  const activeChannels = channelPlan.filter((item) => item.enabled)
  if (activeChannels.length === 0) {
    return output
  }

  let processedRows = 0
  const totalRows = height * activeChannels.length

  for (const { offset } of activeChannels) {
    for (let y = 0; y < height; y += 1) {
      if (options?.signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const rowStart = y * width * 4
      for (let x = 0; x < width; x += 1) {
        const index = rowStart + x * 4 + offset
        dst[index] = convolveAt(src, width, height, offset, x, y, kernel, padding)
      }

      processedRows += 1
      if (processedRows % ROWS_PER_YIELD === 0) {
        options?.onProgress?.(processedRows / totalRows)
        await yieldToMainThread()
      }
    }
  }

  for (const { offset, enabled } of channelPlan) {
    if (enabled) {
      continue
    }

    for (let i = offset; i < dst.length; i += 4) {
      dst[i] = src[i]
    }
  }

  options?.onProgress?.(1)
  return output
}
