type SaveFormat = 'png' | 'jpg' | 'gb7'

type ToolbarProps = {
  hasImage: boolean
  saveFormat: SaveFormat
  useMask: boolean
  onOpenClick: () => void
  onSaveClick: () => void
  onSaveFormatChange: (format: SaveFormat) => void
  onUseMaskChange: (value: boolean) => void
}

export function Toolbar({
  hasImage,
  saveFormat,
  useMask,
  onOpenClick,
  onSaveClick,
  onSaveFormatChange,
  onUseMaskChange,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <button type="button" className="toolbar-btn" onClick={onOpenClick}>
        Open
      </button>

      <label className="toolbar-label" htmlFor="save-format">
        Save as
      </label>

      <select
        id="save-format"
        className="toolbar-select"
        value={saveFormat}
        disabled={!hasImage}
        onChange={(event) =>
          onSaveFormatChange(event.target.value as SaveFormat)
        }
      >
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="gb7">GB7</option>
      </select>

      {saveFormat === 'gb7' && (
        <label className="toolbar-check">
          <input
            type="checkbox"
            checked={useMask}
            onChange={(event) => onUseMaskChange(event.target.checked)}
          />
          Include mask
        </label>
      )}

      <button
        type="button"
        className="toolbar-btn"
        disabled={!hasImage}
        onClick={onSaveClick}
      >
        Save
      </button>
    </header>
  )
}
