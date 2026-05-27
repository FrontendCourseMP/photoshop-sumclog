import { useEffect, useRef } from 'react'

type SidePanelProps = {
  imageData: ImageData | null
  displayScale: number
  onScaleChange: (scale: number) => void
}

export function SidePanel({
  imageData,
  displayScale,
  onScaleChange,
}: SidePanelProps) {
  const previewRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas || !imageData) {
      return
    }

    const maxSide = 140
    const ratio = Math.min(
      maxSide / imageData.width,
      maxSide / imageData.height,
      1,
    )
    const width = Math.max(1, Math.round(imageData.width * ratio))
    const height = Math.max(1, Math.round(imageData.height * ratio))

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const temp = document.createElement('canvas')
    temp.width = imageData.width
    temp.height = imageData.height
    temp.getContext('2d')?.putImageData(imageData, 0, 0)
    ctx.drawImage(temp, 0, 0, width, height)
  }, [imageData])

  const zoomPercent = Math.round(displayScale * 100)

  return (
    <aside className="side-panel">
      <section className="panel-block">
        <header className="panel-header">Навигация</header>
        <div className="panel-body">
          {imageData ? (
            <>
              <canvas ref={previewRef} className="nav-preview" />
              <div className="nav-meta">
                <span>W: {imageData.width}</span>
                <span>H: {imageData.height}</span>
              </div>
              <label className="zoom-control" htmlFor="zoom-range">
                Масштаб: {zoomPercent}%
              </label>
              <input
                id="zoom-range"
                type="range"
                min={5}
                max={100}
                value={zoomPercent}
                onChange={(event) =>
                  onScaleChange(Number(event.target.value) / 100)
                }
              />
            </>
          ) : (
            <p className="panel-empty">Нет изображения</p>
          )}
        </div>
      </section>
    </aside>
  )
}
