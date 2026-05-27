import { useMemo, useRef, useState } from 'react'
import type { ChangeEventHandler } from 'react'
import { CanvasView } from './components/CanvasView'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'
import { decodeGB7, encodeGB7 } from './utils/gb7'
import { imageDataToBlob, loadRasterFile, triggerDownload } from './utils/imageIO'
import './App.css'

type SourceFormat = 'png' | 'jpg' | 'gb7'
type SaveFormat = SourceFormat

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [sourceFormat, setSourceFormat] = useState<SourceFormat | null>(null)
  const [saveFormat, setSaveFormat] = useState<SaveFormat>('png')
  const [useMask, setUseMask] = useState(true)
  const [baseName, setBaseName] = useState('image')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const imageWidth = imageData?.width ?? null
  const imageHeight = imageData?.height ?? null

  const acceptTypes = useMemo(() => '.png,.jpg,.jpeg,.gb7', [])

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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load image file'
      window.alert(message)
    }
  }

  const handleOpenClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
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
        error instanceof Error ? error.message : 'Failed to save image file'
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

      <Toolbar
        hasImage={imageData !== null}
        saveFormat={saveFormat}
        useMask={useMask}
        onOpenClick={handleOpenClick}
        onSaveClick={() => void handleSave()}
        onSaveFormatChange={setSaveFormat}
        onUseMaskChange={setUseMask}
      />

      <CanvasView imageData={imageData} onFileDrop={(file) => void handleFile(file)} />

      <StatusBar
        width={imageWidth}
        height={imageHeight}
        sourceFormat={sourceFormat}
      />
    </div>
  )
}

export default App
