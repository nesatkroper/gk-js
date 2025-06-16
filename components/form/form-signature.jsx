"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PenTool, Download, RotateCcw } from "lucide-react"


export default function SignaturePad({
  name = "signature",
  value = "",
  onCallbackInput,
  disabled = false,
  label = "Signature",
  required = false,
}) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [signatureDataUrl, setSignatureDataUrl] = useState(value)
  const [lastPoint, setLastPoint] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => initializeCanvas(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    setSignatureDataUrl(value)
  }, [value])

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set the actual size in memory (scaled up for high-DPI)
    canvas.width = 600 * dpr
    canvas.height = 600 * dpr

    // Scale the canvas back down using CSS
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"

    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr)

    // Set white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 600, 600)

    // Add signature line guide
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(50, 300)
    ctx.lineTo(550, 300)
    ctx.stroke()
    ctx.setLineDash([])

    // Set drawing styles for smooth lines
    ctx.strokeStyle = "black"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.imageSmoothingEnabled = true

    // Load existing signature if available
    if (signatureDataUrl) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 600, 600)
      }
      img.src = signatureDataUrl
    }
  }, [signatureDataUrl])

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ("clientX" in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return { x: 0, y: 0 }
    }

    // Calculate coordinates relative to canvas, scaled to 600x600
    const x = ((clientX - rect.left) / rect.width) * 600
    const y = ((clientY - rect.top) / rect.height) * 600

    return { x, y }
  }

  const drawSmoothLine = (ctx, from, to) => {
    const midPoint = {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2,
    }

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.quadraticCurveTo(from.x, from.y, midPoint.x, midPoint.y)
    ctx.stroke()
  }

  const startDrawing = (e) => {
    if (disabled) return

    e.preventDefault()
    setIsDrawing(true)

    const point = getCanvasCoordinates(e)
    setLastPoint(point)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const draw = (e) => {
    if (!isDrawing || disabled || !lastPoint) return

    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentPoint = getCanvasCoordinates(e)

    // Draw smooth line between last point and current point
    drawSmoothLine(ctx, lastPoint, currentPoint)

    setLastPoint(currentPoint)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  const clearCanvas = () => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear and reset
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 600, 600)

    // Redraw guide line
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(50, 300)
    ctx.lineTo(550, 300)
    ctx.stroke()
    ctx.setLineDash([])

    // Reset drawing styles
    ctx.strokeStyle = "black"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    setSignatureDataUrl("")
    if (onCallbackInput) {
      onCallbackInput(name, "")
    }
  }

  const saveSignature = () => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Create a clean 600x600 canvas for the final signature
    const finalCanvas = document.createElement("canvas")
    finalCanvas.width = 600
    finalCanvas.height = 600
    const finalCtx = finalCanvas.getContext("2d")
    if (!finalCtx) return

    // Set white background
    finalCtx.fillStyle = "white"
    finalCtx.fillRect(0, 0, 600, 600)

    // Draw the signature from the main canvas
    const dpr = window.devicePixelRatio || 1
    finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 600, 600)

    // Add timestamp
    const now = new Date()
    const dateTimeString = now.toLocaleString()
    finalCtx.fillStyle = "black"
    finalCtx.font = "14px Arial"
    finalCtx.fillText(`Signed on: ${dateTimeString}`, 10, 580)

    // Convert to PNG
    const dataUrl = finalCanvas.toDataURL("image/png", 1.0)
    setSignatureDataUrl(dataUrl)

    if (onCallbackInput) {
      onCallbackInput(name, dataUrl)
    }

    setIsOpen(false)
  }

  const downloadSignature = () => {
    if (!signatureDataUrl) return

    const link = document.createElement("a")
    link.download = `signature-${new Date().getTime()}.png`
    link.href = signatureDataUrl
    link.click()
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-center h-20"
            disabled={disabled}
            type="button"
          >
            <PenTool className="w-4 h-4" />
            {signatureDataUrl ? "Edit Signature" : "Create Signature"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Digital Signature Pad</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair touch-none block"
                onMouseDown={(e) => startDrawing(e.nativeEvent)}
                onMouseMove={(e) => draw(e.nativeEvent)}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => startDrawing(e.nativeEvent)}
                onTouchMove={(e) => draw(e.nativeEvent)}
                onTouchEnd={stopDrawing}
                style={{
                  width: "600px",
                  height: "600px",
                  maxWidth: "90vw",
                  maxHeight: "60vh",
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button onClick={clearCanvas} variant="outline" disabled={disabled}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={saveSignature} disabled={disabled}>
                Save Signature
              </Button>
              {signatureDataUrl && (
                <Button onClick={downloadSignature} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {signatureDataUrl && (
        <div className="mt-2 p-2 border rounded-lg bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Signature Preview:</p>
          <img
            src={signatureDataUrl || "/placeholder.svg"}
            alt="Signature preview"
            className="max-w-full h-20 object-contain border rounded bg-white"
          />
        </div>
      )}
    </div>
  )
}
