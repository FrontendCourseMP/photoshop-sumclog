type MenuBarProps = {
  onOpenClick: () => void
  onSaveClick: () => void
  onLevelsClick: () => void
  canSave: boolean
  canLevels: boolean
}

export function MenuBar({
  onOpenClick,
  onSaveClick,
  onLevelsClick,
  canSave,
  canLevels,
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
        </div>
      </details>
    </nav>
  )
}
