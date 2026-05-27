type MenuBarProps = {
  onOpenClick: () => void
  onSaveClick: () => void
  canSave: boolean
}

export function MenuBar({ onOpenClick, onSaveClick, canSave }: MenuBarProps) {
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
      <span className="menu-app-title">Редактор изображений</span>
    </nav>
  )
}
