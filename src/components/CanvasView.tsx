import { useEffect, useRef } from 'react'
import type { DragEventHandler, MouseEvent } from 'react'

type CanvasViewProps = {
  imageData: ImageData | null
  displayScale: number
  onFileDrop: (file: File) => void
  onViewportReady: (width: number, height: number) => void
  onCanvasPick?: (x: number, y: number) => void
}

export function CanvasView({
  imageData,
  displayScale,
  onFileDrop,
  onViewportReady,
  onCanvasPick,
}: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    if (!imageData) {
      canvas.width = 1
      canvas.height = 1
      ctx.clearRect(0, 0, 1, 1)
      return
    }

    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)
  }, [imageData])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    const notify = () => {
      onViewportReady(viewport.clientWidth, viewport.clientHeight)
    }

    notify()

    const observer = new ResizeObserver(notify)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [onViewportReady])

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files.item(0)
    if (file) {
      onFileDrop(file)
    }
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
  }

  const displayWidth = imageData
    ? Math.round(imageData.width * displayScale)
    : 0
  const displayHeight = imageData
    ? Math.round(imageData.height * displayScale)
    : 0

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!imageData || !onCanvasPick) {
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const scaleX = imageData.width / rect.width
    const scaleY = imageData.height / rect.height
    const x = Math.max(
      0,
      Math.min(imageData.width - 1, Math.floor((event.clientX - rect.left) * scaleX)),
    )
    const y = Math.max(
      0,
      Math.min(
        imageData.height - 1,
        Math.floor((event.clientY - rect.top) * scaleY),
      ),
    )
    onCanvasPick(x, y)
  }

  return (
    <main
      className="canvas-shell"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div ref={viewportRef} className="canvas-scroll">
        {imageData ? (
          <div
            className="canvas-frame"
            style={{ width: displayWidth, height: displayHeight }}
          >
            <canvas
              ref={canvasRef}
              className="image-canvas"
              style={{ width: displayWidth, height: displayHeight }}
              onClick={handleCanvasClick}
            />
          </div>
        ) : (
          <div className="canvas-placeholder">
            Перетащите изображение сюда или нажмите «Открыть»
          </div>
        )}
      </div>
    </main>
  )
}
