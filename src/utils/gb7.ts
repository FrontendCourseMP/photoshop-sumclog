const GB7_SIGNATURE = [0x47, 0x42, 0x37, 0x1d] as const
const GB7_VERSION = 0x01
const HEADER_SIZE = 12

function assertSignature(view: DataView): void {
  for (let i = 0; i < GB7_SIGNATURE.length; i += 1) {
    if (view.getUint8(i) !== GB7_SIGNATURE[i]) {
      throw new Error('Invalid GB7 signature')
    }
  }
}

export function decodeGB7(
  buffer: ArrayBuffer,
): { imageData: ImageData; width: number; height: number; hasMask: boolean } {
  if (buffer.byteLength < HEADER_SIZE) {
    throw new Error('GB7 file is too small')
  }

  const view = new DataView(buffer)
  assertSignature(view)

  const version = view.getUint8(4)
  if (version !== GB7_VERSION) {
    throw new Error(`Unsupported GB7 version: ${version}`)
  }

  const flags = view.getUint8(5)
  if ((flags & 0b11111110) !== 0) {
    throw new Error('GB7 reserved flag bits must be zero')
  }

  const width = view.getUint16(6, false)
  const height = view.getUint16(8, false)
  const reserved = view.getUint16(10, false)
  if (reserved !== 0) {
    throw new Error('GB7 reserved field must be zero')
  }

  const pixelCount = width * height
  const expectedSize = HEADER_SIZE + pixelCount
  if (buffer.byteLength !== expectedSize) {
    throw new Error('GB7 pixel data size mismatch')
  }

  const hasMask = (flags & 0b00000001) === 1
  const output = new Uint8ClampedArray(pixelCount * 4)
  const pixels = new Uint8Array(buffer, HEADER_SIZE)

  for (let i = 0; i < pixelCount; i += 1) {
    const packed = pixels[i]
    const gray7 = packed & 0b01111111
    const gray8 = gray7 << 1
    const alpha = hasMask ? ((packed & 0b10000000) === 0 ? 0 : 255) : 255
    const outOffset = i * 4

    output[outOffset] = gray8
    output[outOffset + 1] = gray8
    output[outOffset + 2] = gray8
    output[outOffset + 3] = alpha
  }

  return {
    imageData: new ImageData(output, width, height),
    width,
    height,
    hasMask,
  }
}

export function encodeGB7(imageData: ImageData, useMask: boolean): ArrayBuffer {
  const { width, height, data } = imageData
  const pixelCount = width * height
  const buffer = new ArrayBuffer(HEADER_SIZE + pixelCount)
  const view = new DataView(buffer)
  const pixels = new Uint8Array(buffer, HEADER_SIZE)

  GB7_SIGNATURE.forEach((byte, index) => {
    view.setUint8(index, byte)
  })

  view.setUint8(4, GB7_VERSION)
  view.setUint8(5, useMask ? 0b00000001 : 0)
  view.setUint16(6, width, false)
  view.setUint16(8, height, false)
  view.setUint16(10, 0, false)

  for (let i = 0; i < pixelCount; i += 1) {
    const offset = i * 4
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const a = data[offset + 3]

    const gray8 = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    const gray7 = gray8 >> 1
    const maskBit = useMask ? (a < 128 ? 0 : 0b10000000) : 0

    pixels[i] = maskBit | gray7
  }

  return buffer
}
