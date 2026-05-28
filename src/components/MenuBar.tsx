type MenuBarProps = {
  onOpenClick: () => void
  onSaveClick: () => void
  onLevelsClick: () => void
  onScaleClick: () => void
  onCustomFilterClick: () => void
  canSave: boolean
  canLevels: boolean
  canScale: boolean
  canCustomFilter: boolean
}

export function MenuBar({
  onOpenClick,
  onSaveClick,
  onLevelsClick,
  onScaleClick,
  onCustomFilterClick,
  canSave,
  canLevels,
  canScale,
  canCustomFilter,
}: MenuBarProps) {
  return (
    <nav className="menu-bar" aria-label="Главное меню">
      <details className="menu-dropdown">
        <summary>Файл</summary>
        <div className="menu-dropdown-panel">
          <button type="button" onClick={onOpenClick}>
            Открыть…
          </button>
          <button type="button" disabled={!canSave} onClick={onSaveClick}>
            Сохранить
          </button>
        </div>
      </details>
      <details className="menu-dropdown">
        <summary>Изображение</summary>
        <div className="menu-dropdown-panel">
          <button type="button" disabled={!canLevels} onClick={onLevelsClick}>
            Уровни…
          </button>
          <button type="button" disabled={!canScale} onClick={onScaleClick}>
            Масштаб…
          </button>
        </div>
      </details>
      <details className="menu-dropdown">
        <summary>Фильтр</summary>
        <div className="menu-dropdown-panel">
          <button
            type="button"
            disabled={!canCustomFilter}
            onClick={onCustomFilterClick}
          >
            Произвольный…
          </button>
        </div>
      </details>
    </nav>
  )
}
