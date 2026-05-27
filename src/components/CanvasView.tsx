import { useEffect, useRef } from 'react'
import type { DragEventHandler } from 'react'

type CanvasViewProps = {
  imageData: ImageData | null
  onFileDrop: (file: File) => void
}

export function CanvasView({ imageData, onFileDrop }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

  return (
    <main className="canvas-shell" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="canvas-scroll">
        {imageData ? (
          <canvas ref={canvasRef} className="image-canvas" />
        ) : (
          <div className="canvas-placeholder">
            Drop an image here or use the Open button
          </div>
        )}
      </div>
    </main>
  )
}
