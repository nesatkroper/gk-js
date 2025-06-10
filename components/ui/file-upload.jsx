


"use client"


import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon, Crop } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateFile, getFilePreviewUrl } from "@/lib/file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 10,
  preview = true,
  value,
  placeholder = "Click to upload or drag and drop",
  className,
  showAspectRatioSelector = true,
}) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [aspectRatio, setAspectRatio] = useState < "original" | "1:1" | "3:4" > ("original")
  const inputRef = useRef(null)

  React.useEffect(() => {
    if (value && preview) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)

      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [value, preview])

  const handleFile = (file) => {
    setError(null)

    const validationError = validateFile(file, maxSize)
    if (validationError) {
      setError(validationError)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    onFileSelect(file, aspectRatio)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }



  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    onFileSelect(null)
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleAspectRatioChange = (value) => {
    setAspectRatio(value)
  }

  return (
    <div className={cn("space-y-3", className)}>


      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error ? "border-destructive" : "",
          "hover:border-primary/50 hover:bg-primary/5",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {previewUrl ? (
          <div className="flex items-center justify-center">
            <div className="relative">
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg",
                  aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "3:4" ? "aspect-[3/4]" : "",
                )}
              >
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className={cn(
                    "rounded-lg object-cover",
                    aspectRatio !== "original" ? "w-full " : "max-w-full max-h-40",
                  )}
                  onError={(e) => {
                    (e.target).src = "/placeholder.svg"
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
            <p className="text-xs text-muted-foreground">Max file size: {maxSize}MB • Will convert to WebP</p>
          </div>
        )}

      </div>
      {showAspectRatioSelector && (
        <div className="flex items-center space-x-2">
          <Crop className="h-4 w-4 text-muted-foreground" />
          <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Aspect Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original Ratio</SelectItem>
              <SelectItem value="1:1">Square (1:1)</SelectItem>
              <SelectItem value="3:4">Portrait (3:4)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {aspectRatio === "original" ? "Max 800×800" : aspectRatio === "1:1" ? "800×800" : "600×800"}
          </span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span className="truncate max-w-[150px]">{value.name}</span>
          <span>({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
        </div>
      )}
    </div>
  )
}


