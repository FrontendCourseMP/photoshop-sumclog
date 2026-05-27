type SourceFormat = 'png' | 'jpg' | 'gb7' | null

type StatusBarProps = {
  width: number | null
  height: number | null
  sourceFormat: SourceFormat
}

function getColorDepth(format: SourceFormat): string {
  if (format === 'gb7') {
    return '7-bit grayscale'
  }

  if (format === 'jpg') {
    return '24-bit RGB'
  }

  if (format === 'png') {
    return '32-bit RGBA'
  }

  return 'No image loaded'
}

export function StatusBar({ width, height, sourceFormat }: StatusBarProps) {
  const hasSize = width !== null && height !== null
  const size = hasSize ? `${width} × ${height} px` : '-- × -- px'

  return (
    <footer className="status-bar">
      {size} | {getColorDepth(sourceFormat)}
    </footer>
  )
}
