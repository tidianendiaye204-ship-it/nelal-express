'use client'

import { useRef, useState, useEffect } from 'react'
import { Eraser, Check, MousePointer2 } from 'lucide-react'

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void
  onClear?: () => void
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution for high DPI screens
    const ratio = window.devicePixelRatio || 1
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.scale(ratio, ratio)
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#0F172A' // Slate 900
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setIsEmpty(false)
    
    // Prevent scrolling when touching the canvas
    if (e.cancelable) e.preventDefault()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const { x, y } = getCoordinates(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    
    if (e.cancelable) e.preventDefault()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      onSave(canvas.toDataURL('image/png'))
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setIsEmpty(true)
      if (onClear) onClear()
    }
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <MousePointer2 className="w-3 h-3" /> Signature du bénéficiaire
        </label>
        <button 
          onClick={clear}
          className="text-[9px] font-bold text-red-500 uppercase flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
        >
          <Eraser className="w-3 h-3" /> Effacer
        </button>
      </div>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-crosshair active:border-orange-400 touch-none transition-colors"
        />
        
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Signer ici</span>
          </div>
        )}
        
        {!isEmpty && !isDrawing && (
          <div className="absolute top-2 right-2 flex h-5 w-5 bg-green-500 rounded-full items-center justify-center shadow-lg shadow-green-500/20">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
