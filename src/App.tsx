import { useCallback, useMemo, useRef, useState } from 'react'
import type { ChangeEventHandler } from 'react'
import { CanvasView } from './components/CanvasView'
import { MenuBar } from './components/MenuBar'
import { SidePanel } from './components/SidePanel'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'
import { decodeGB7, encodeGB7 } from './utils/gb7'
import { imageDataToBlob, loadRasterFile, triggerDownload } from './utils/imageIO'
import { fitScaleToFullHd } from './utils/viewport'
import './App.css'

type SourceFormat = 'png' | 'jpg' | 'gb7'
type SaveFormat = SourceFormat

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [sourceFormat, setSourceFormat] = useState<SourceFormat | null>(null)
  const [saveFormat, setSaveFormat] = useState<SaveFormat>('png')
  const [useMask, setUseMask] = useState(true)
  const [baseName, setBaseName] = useState('image')
  const [userScale, setUserScale] = useState<number | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const imageWidth = imageData?.width ?? null
  const imageHeight = imageData?.height ?? null

  const acceptTypes = useMemo(() => '.png,.jpg,.jpeg,.gb7', [])

  const handleViewportReady = useCallback((width: number, height: number) => {
    setViewportSize((prev) => {
      if (prev.width === width && prev.height === height) {
        return prev
      }
      return { width, height }
    })
  }, [])

  const autoScale = useMemo(() => {
    if (!imageData || viewportSize.width <= 0 || viewportSize.height <= 0) {
      return 1
    }

    const padding = 48
    return fitScaleToFullHd(
      imageData.width,
      imageData.height,
      viewportSize.width - padding,
      viewportSize.height - padding,
    )
  }, [imageData, viewportSize])

  const displayScale = userScale ?? autoScale

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase()
    const nextBaseName = file.name.replace(/\.[^/.]+$/, '') || 'image'

    try {
      if (name.endsWith('.gb7')) {
        const buffer = await file.arrayBuffer()
        const decoded = decodeGB7(buffer)
        setImageData(decoded.imageData)
        setSourceFormat('gb7')
        setSaveFormat('gb7')
      } else {
        const loaded = await loadRasterFile(file)
        setImageData(loaded.imageData)
        setSourceFormat(loaded.format)
        setSaveFormat(loaded.format)
      }

      setBaseName(nextBaseName)
      setUserScale(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось загрузить файл'
      window.alert(message)
    }
  }

  const handleOpenClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.item(0)
    if (file) {
      void handleFile(file)
    }
    event.target.value = ''
  }

  const handleSave = async () => {
    if (!imageData) {
      return
    }

    try {
      if (saveFormat === 'gb7') {
        const buffer = encodeGB7(imageData, useMask)
        const blob = new Blob([buffer], {
          type: 'application/octet-stream',
        })
        triggerDownload(blob, `${baseName}.gb7`)
        return
      }

      const blob = await imageDataToBlob(imageData, saveFormat)
      triggerDownload(blob, `${baseName}.${saveFormat}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось сохранить файл'
      window.alert(message)
    }
  }

  return (
    <div className="app-shell">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        hidden
        onChange={handleInputChange}
      />

      <MenuBar
        onOpenClick={handleOpenClick}
        onSaveClick={() => void handleSave()}
        canSave={imageData !== null}
      />

      <Toolbar
        hasImage={imageData !== null}
        saveFormat={saveFormat}
        useMask={useMask}
        onOpenClick={handleOpenClick}
        onSaveClick={() => void handleSave()}
        onSaveFormatChange={setSaveFormat}
        onUseMaskChange={setUseMask}
      />

      <div className="left-rail" aria-hidden="true">
        <button type="button" className="rail-btn active" title="Выделение">
          <svg viewBox="0 0 24 24">
            <path d="M4 4l8 18 2-8 8-2z" />
          </svg>
        </button>
      </div>

      <CanvasView
        imageData={imageData}
        displayScale={displayScale}
        onFileDrop={(file) => void handleFile(file)}
        onViewportReady={handleViewportReady}
      />

      <SidePanel
        imageData={imageData}
        displayScale={displayScale}
        onScaleChange={setUserScale}
      />

      <StatusBar
        width={imageWidth}
        height={imageHeight}
        sourceFormat={sourceFormat}
        displayScale={displayScale}
        canSave={imageData !== null}
        onSaveClick={() => void handleSave()}
      />
    </div>
  )
}

export default App
