export type LevelsChannel = 'master' | 'red' | 'green' | 'blue' | 'alpha'

export type ChannelLevels = {
  inBlack: number
  inWhite: number
  gamma: number
}

export type LevelsSettings = Record<LevelsChannel, ChannelLevels>

export const DEFAULT_CHANNEL_LEVELS: ChannelLevels = {
  inBlack: 0,
  inWhite: 255,
  gamma: 1,
}

export const DEFAULT_LEVELS_SETTINGS: LevelsSettings = {
  master: { ...DEFAULT_CHANNEL_LEVELS },
  red: { ...DEFAULT_CHANNEL_LEVELS },
  green: { ...DEFAULT_CHANNEL_LEVELS },
  blue: { ...DEFAULT_CHANNEL_LEVELS },
  alpha: { ...DEFAULT_CHANNEL_LEVELS },
}

export type HistogramMode = 'linear' | 'log'

export type HistogramData = {
  bins: Uint32Array
  maxCount: number
  rgbBins?: { r: Uint32Array; g: Uint32Array; b: Uint32Array }
}

const LUM_R = 0.2126
const LUM_G = 0.7152
const LUM_B = 0.0722

export function luminance(r: number, g: number, b: number): number {
  return Math.round(LUM_R * r + LUM_G * g + LUM_B * b)
}

export function computeHistogram(
  imageData: ImageData,
  channel: LevelsChannel,
): HistogramData {
  const bins = new Uint32Array(256)
  const data = imageData.data
  const pixelCount = imageData.width * imageData.height

  if (channel === 'master') {
    const rBins = new Uint32Array(256)
    const gBins = new Uint32Array(256)
    const bBins = new Uint32Array(256)

    for (let i = 0; i < data.length; i += 4) {
      const lum = luminance(data[i], data[i + 1], data[i + 2])
      bins[lum]++
      rBins[data[i]]++
      gBins[data[i + 1]]++
      bBins[data[i + 2]]++
    }

    let maxCount = 0
    for (let i = 0; i < 256; i++) {
      if (bins[i] > maxCount) maxCount = bins[i]
    }

    return { bins, maxCount, rgbBins: { r: rBins, g: gBins, b: bBins } }
  }

  const channelIndex =
    channel === 'red' ? 0 : channel === 'green' ? 1 : channel === 'blue' ? 2 : 3

  for (let i = channelIndex; i < data.length; i += 4) {
    bins[data[i]]++
  }

  let maxCount = 0
  for (let i = 0; i < 256; i++) {
    if (bins[i] > maxCount) maxCount = bins[i]
  }

  void pixelCount
  return { bins, maxCount }
}

export function buildLevelsLut(levels: ChannelLevels): Uint8Array {
  const lut = new Uint8Array(256)
  const { inBlack, inWhite, gamma } = levels
  const range = Math.max(1, inWhite - inBlack)
  const invGamma = 1 / Math.max(0.1, Math.min(9.9, gamma))

  for (let i = 0; i < 256; i++) {
    let t = (i - inBlack) / range
    t = Math.max(0, Math.min(1, t))
    const out = Math.round(255 * t ** invGamma)
    lut[i] = Math.max(0, Math.min(255, out))
  }

  return lut
}

export function applyLevels(
  source: ImageData,
  settings: LevelsSettings,
): ImageData {
  const output = new ImageData(source.width, source.height)
  const src = source.data
  const dst = output.data

  const lutR = buildLevelsLut(settings.red)
  const lutG = buildLevelsLut(settings.green)
  const lutB = buildLevelsLut(settings.blue)
  const lutA = buildLevelsLut(settings.alpha)

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = lutR[src[i]]
    dst[i + 1] = lutG[src[i + 1]]
    dst[i + 2] = lutB[src[i + 2]]
    dst[i + 3] = lutA[src[i + 3]]
  }

  return output
}

export function cloneImageData(imageData: ImageData): ImageData {
  const copy = new ImageData(imageData.width, imageData.height)
  copy.data.set(imageData.data)
  return copy
}

export function clampChannelLevels(levels: ChannelLevels): ChannelLevels {
  const inBlack = Math.max(0, Math.min(255, Math.round(levels.inBlack)))
  const inWhite = Math.max(0, Math.min(255, Math.round(levels.inWhite)))
  const black = Math.min(inBlack, inWhite - 1)
  const white = Math.max(inWhite, black + 1)
  const gamma = Math.max(0.1, Math.min(9.9, levels.gamma))

  return { inBlack: black, inWhite: white, gamma }
}

export function gammaToSliderPosition(
  gamma: number,
  inBlack: number,
  inWhite: number,
): number {
  const range = inWhite - inBlack
  if (range <= 1) return (inBlack + inWhite) / 2
  const mid = inBlack + range * 0.5 ** (1 / gamma)
  return Math.max(inBlack + 1, Math.min(inWhite - 1, mid))
}

export function sliderPositionToGamma(
  position: number,
  inBlack: number,
  inWhite: number,
): number {
  const range = inWhite - inBlack
  if (range <= 1) return 1
  const t = (position - inBlack) / range
  const clamped = Math.max(0.001, Math.min(0.999, t))
  const gamma = Math.log(0.5) / Math.log(clamped)
  return Math.max(0.1, Math.min(9.9, gamma))
}
