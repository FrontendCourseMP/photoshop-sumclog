import { useEffect, useRef, useState } from 'react'

type MenuId = 'file' | 'image' | 'filter'

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
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const barRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!openMenu) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenu])

  const toggleMenu = (menu: MenuId) => {
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }

  const runAndClose = (action: () => void) => {
    action()
    setOpenMenu(null)
  }

  return (
    <nav ref={barRef} className="menu-bar" aria-label="Главное меню">
      <div className={`menu-dropdown ${openMenu === 'file' ? 'open' : ''}`}>
        <button
          type="button"
          className="menu-dropdown-trigger"
          aria-expanded={openMenu === 'file'}
          aria-haspopup="menu"
          onClick={() => toggleMenu('file')}
        >
          Файл
        </button>
        {openMenu === 'file' && (
          <div className="menu-dropdown-panel" role="menu">
            <button type="button" role="menuitem" onClick={() => runAndClose(onOpenClick)}>
              Открыть…
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!canSave}
              onClick={() => runAndClose(onSaveClick)}
            >
              Сохранить
            </button>
          </div>
        )}
      </div>

      <div className={`menu-dropdown ${openMenu === 'image' ? 'open' : ''}`}>
        <button
          type="button"
          className="menu-dropdown-trigger"
          aria-expanded={openMenu === 'image'}
          aria-haspopup="menu"
          onClick={() => toggleMenu('image')}
        >
          Изображение
        </button>
        {openMenu === 'image' && (
          <div className="menu-dropdown-panel" role="menu">
            <button
              type="button"
              role="menuitem"
              disabled={!canLevels}
              onClick={() => runAndClose(onLevelsClick)}
            >
              Уровни…
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!canScale}
              onClick={() => runAndClose(onScaleClick)}
            >
              Масштаб…
            </button>
          </div>
        )}
      </div>

      <div className={`menu-dropdown ${openMenu === 'filter' ? 'open' : ''}`}>
        <button
          type="button"
          className="menu-dropdown-trigger"
          aria-expanded={openMenu === 'filter'}
          aria-haspopup="menu"
          onClick={() => toggleMenu('filter')}
        >
          Фильтр
        </button>
        {openMenu === 'filter' && (
          <div className="menu-dropdown-panel" role="menu">
            <button
              type="button"
              role="menuitem"
              disabled={!canCustomFilter}
              onClick={() => runAndClose(onCustomFilterClick)}
            >
              Произвольный…
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
