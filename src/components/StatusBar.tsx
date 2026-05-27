type SourceFormat = 'png' | 'jpg' | 'gb7' | null

type StatusBarProps = {
  width: number | null
  height: number | null
  sourceFormat: SourceFormat
  displayScale: number
  canSave: boolean
  onSaveClick: () => void
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
  displayScale,
  canSave,
  onSaveClick,
}: StatusBarProps) {
  const hasSize = width !== null && height !== null
  const zoomPercent = Math.round(displayScale * 100)
  const size = hasSize
    ? `${width} × ${height} px @ ${zoomPercent}%`
    : '-- × -- px'

  return (
    <footer className="status-bar">
      <span className="status-info">
        {size} | {getColorDepth(sourceFormat)}
      </span>
      <button
        type="button"
        className="status-save-btn"
        disabled={!canSave}
        onClick={onSaveClick}
        title="Сохранить"
        aria-label="Сохранить"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 19h14" />
        </svg>
      </button>
    </footer>
  )
}
