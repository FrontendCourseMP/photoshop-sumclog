import { useMemo, useState } from 'react'
import {
  DEFAULT_INTERPOLATION,
  INTERPOLATION_METHODS,
  megapixels,
  resizeImageData,
  type InterpolationMethod,
} from '../utils/interpolation'
import { Modal } from './Modal'
import './ScaleImageDialog.css'

type SizeUnit = 'percent' | 'pixels'

type ScaleImageDialogProps = {
  imageData: ImageData
  onApply: (result: ImageData) => void
  onClose: () => void
}

const MIN_SIDE = 1
const MAX_SIDE = 16_384
const MIN_PERCENT = 1
const MAX_PERCENT = 1_000

function formatMp(value: number): string {
  return value.toFixed(2)
}

export function ScaleImageDialog({
  imageData,
  onApply,
  onClose,
}: ScaleImageDialogProps) {
  const sourceWidth = imageData.width
  const sourceHeight = imageData.height

  const [unit, setUnit] = useState<SizeUnit>('percent')
  const [widthValue, setWidthValue] = useState(100)
  const [heightValue, setHeightValue] = useState(100)
  const [keepAspect, setKeepAspect] = useState(true)
  const [method, setMethod] = useState<InterpolationMethod>(DEFAULT_INTERPOLATION)
  const [error, setError] = useState<string | null>(null)

  const targetSize = useMemo(() => {
    if (unit === 'percent') {
      return {
        width: Math.round((sourceWidth * widthValue) / 100),
        height: Math.round((sourceHeight * heightValue) / 100),
      }
    }

    return {
      width: Math.round(widthValue),
      height: Math.round(heightValue),
    }
  }, [unit, widthValue, heightValue, sourceWidth, sourceHeight])

  const sourceMp = megapixels(sourceWidth, sourceHeight)
  const targetMp = megapixels(targetSize.width, targetSize.height)
  const methodInfo = INTERPOLATION_METHODS[method]

  const validate = (): string | null => {
    if (unit === 'percent') {
      if (
        widthValue < MIN_PERCENT ||
        widthValue > MAX_PERCENT ||
        heightValue < MIN_PERCENT ||
        heightValue > MAX_PERCENT
      ) {
        return `Проценты: от ${MIN_PERCENT} до ${MAX_PERCENT}.`
      }
    } else if (
      widthValue < MIN_SIDE ||
      widthValue > MAX_SIDE ||
      heightValue < MIN_SIDE ||
      heightValue > MAX_SIDE
    ) {
      return `Размер в пикселях: от ${MIN_SIDE} до ${MAX_SIDE}.`
    }

    if (
      targetSize.width < MIN_SIDE ||
      targetSize.width > MAX_SIDE ||
      targetSize.height < MIN_SIDE ||
      targetSize.height > MAX_SIDE
    ) {
      return `Итоговый размер: от ${MIN_SIDE} до ${MAX_SIDE} px.`
    }

    return null
  }

  const updateWidth = (raw: number) => {
    setError(null)
    setWidthValue(raw)
    if (keepAspect && sourceWidth > 0) {
      if (unit === 'percent') {
        setHeightValue(raw)
      } else {
        setHeightValue(Math.round((raw / sourceWidth) * sourceHeight))
      }
    }
  }

  const updateHeight = (raw: number) => {
    setError(null)
    setHeightValue(raw)
    if (keepAspect && sourceHeight > 0) {
      if (unit === 'percent') {
        setWidthValue(raw)
      } else {
        setWidthValue(Math.round((raw / sourceHeight) * sourceWidth))
      }
    }
  }

  const handleApply = () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const result = resizeImageData(
      imageData,
      targetSize.width,
      targetSize.height,
      method,
    )
    onApply(result)
    onClose()
  }

  const footer = (
    <>
      <button type="button" className="app-modal-btn" onClick={onClose}>
        Отмена
      </button>
      <button
        type="button"
        className="app-modal-btn app-modal-btn-primary"
        onClick={handleApply}
      >
        OK
      </button>
    </>
  )

  return (
    <Modal open title="Изменение масштаба" onClose={onClose} footer={footer}>
      <div className="scale-form">
        <div className="scale-mp-info">
          <span>
            Пикселей до: {formatMp(sourceMp)} Мп ({sourceWidth} × {sourceHeight})
          </span>
          <span>
            Пикселей после: {formatMp(targetMp)} Мп ({targetSize.width} ×{' '}
            {targetSize.height})
          </span>
        </div>

        <div className="scale-row">
          <label htmlFor="scale-unit">Единицы</label>
          <select
            id="scale-unit"
            value={unit}
            onChange={(event) => {
              const nextUnit = event.target.value as SizeUnit
              setUnit(nextUnit)
              if (nextUnit === 'percent') {
                setWidthValue(100)
                setHeightValue(100)
              } else {
                setWidthValue(sourceWidth)
                setHeightValue(sourceHeight)
              }
              setError(null)
            }}
          >
            <option value="percent">Проценты</option>
            <option value="pixels">Пиксели</option>
          </select>
        </div>

        <div className="scale-dimensions">
          <div className="scale-row">
            <label htmlFor="scale-width">Ширина</label>
            <input
              id="scale-width"
              type="number"
              min={unit === 'percent' ? MIN_PERCENT : MIN_SIDE}
              max={unit === 'percent' ? MAX_PERCENT : MAX_SIDE}
              value={widthValue}
              onChange={(event) => updateWidth(Number(event.target.value))}
            />
          </div>
          <div className="scale-row">
            <label htmlFor="scale-height">Высота</label>
            <input
              id="scale-height"
              type="number"
              min={unit === 'percent' ? MIN_PERCENT : MIN_SIDE}
              max={unit === 'percent' ? MAX_PERCENT : MAX_SIDE}
              value={heightValue}
              onChange={(event) => updateHeight(Number(event.target.value))}
            />
          </div>
        </div>

        <label className="scale-check">
          <input
            type="checkbox"
            checked={keepAspect}
            onChange={(event) => setKeepAspect(event.target.checked)}
          />
          Сохранить пропорции
        </label>

        <div className="scale-row">
          <label htmlFor="scale-method">Интерполяция</label>
          <select
            id="scale-method"
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as InterpolationMethod)
            }
          >
            {(Object.keys(INTERPOLATION_METHODS) as InterpolationMethod[]).map(
              (key) => (
                <option key={key} value={key}>
                  {INTERPOLATION_METHODS[key].label}
                </option>
              ),
            )}
          </select>
        </div>

        <p className="scale-tooltip" title={methodInfo.description}>
          {methodInfo.description}
        </p>

        {error && <p className="scale-error">{error}</p>}
      </div>
    </Modal>
  )
}
