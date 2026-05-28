type SourceFormat = 'png' | 'jpg' | 'gb7' | null

type StatusBarProps = {
  width: number | null
  height: number | null
  sourceFormat: SourceFormat
  viewScalePercent: number
}

function getColorDepth(format: SourceFormat): string {
  if (format === 'gb7') {
    return '7-бит grayscale'
  }

  if (format === 'jpg') {
    return '24-бит RGB'
  }

  if (format === 'png') {
    return '32-бит RGBA'
  }

  return 'изображение не загружено'
}

export function StatusBar({
  width,
  height,
  sourceFormat,
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
        {size} | {getColorDepth(sourceFormat)}
      </span>
    </footer>
  )
}
