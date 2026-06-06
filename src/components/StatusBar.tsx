type SourceFormat = 'png' | 'jpg' | 'gb7' | null

type StatusBarProps = {
  width: number | null
  height: number | null
  sourceFormat: SourceFormat
  hasAlpha: boolean
  viewScalePercent: number
}

function getColorDepth(format: SourceFormat, hasAlpha: boolean): string {
  if (format === 'gb7') {
    return '7-бит grayscale'
  }

  if (format === 'jpg') {
    return '24-бит RGB'
  }

  if (format === 'png') {
    return hasAlpha ? '32-бит RGBA' : '24-бит RGB'
  }

  return 'изображение не загружено'
}

export function StatusBar({
  width,
  height,
  sourceFormat,
  hasAlpha,
  viewScalePercent,
}: StatusBarProps) {
  const hasSize = width !== null && height !== null
  const zoomPercent = Math.round(viewScalePercent)
  const size = hasSize
    ? `${width} × ${height} px @ ${zoomPercent}%`
    : '-- × -- px'

  return (
    <footer className="status-bar">
      <span className="status-info">
        {size} | {getColorDepth(sourceFormat, hasAlpha)}
      </span>
    </footer>
  )
}
