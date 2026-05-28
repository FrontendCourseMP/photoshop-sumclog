import { useEffect, useRef } from 'react'
import type { DragEventHandler, MouseEvent } from 'react'

type CanvasViewProps = {
  displayImageData: ImageData | null
  pickImageData: ImageData | null
  onFileDrop: (file: File) => void
  onViewportReady: (width: number, height: number) => void
  onCanvasPick?: (x: number, y: number) => void
}

export function CanvasView({
  displayImageData,
  pickImageData,
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

    if (!displayImageData) {
      canvas.width = 1
      canvas.height = 1
      ctx.clearRect(0, 0, 1, 1)
      return
    }

    canvas.width = displayImageData.width
    canvas.height = displayImageData.height
    ctx.putImageData(displayImageData, 0, 0)
  }, [displayImageData])

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

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!displayImageData || !pickImageData || !onCanvasPick) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top

    const x = Math.max(
      0,
      Math.min(
        pickImageData.width - 1,
        Math.floor((localX / displayImageData.width) * pickImageData.width),
      ),
    )
    const y = Math.max(
      0,
      Math.min(
        pickImageData.height - 1,
        Math.floor((localY / displayImageData.height) * pickImageData.height),
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
        {displayImageData ? (
          <div className="canvas-frame">
            <canvas
              ref={canvasRef}
              className="image-canvas"
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
