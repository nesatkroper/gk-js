"use client"

import { useState, useCallback } from "react"
import { uploadFile } from "@/utils/file-upload"


export function useMultiFileUpload(options) {
  const [state, setState] = useState({
    isUploading: false,
    error: null,
    progress: 0,
  })

  const uploadFiles = useCallback(
    async (files) => {
      if (!files || Object.keys(files).filter((key) => files[key]).length === 0) {
        return {}
      }

      setState({ isUploading: true, error: null, progress: 0 })
      options?.onUploadStart?.()

      try {
        const fileEntries = Object.entries(files).filter(([_, file]) => file !== undefined)
        const totalFiles = fileEntries.length
        let completedFiles = 0
        const urls = {}

        for (const [fieldName, file] of fileEntries) {
          if (file) {
            try {
              const url = await uploadFile(file)
              urls[fieldName] = url
              completedFiles++
              setState((prev) => ({
                ...prev,
                progress: Math.round((completedFiles / totalFiles) * 100),
              }))
            } catch (error) {
              console.error(`Error uploading ${fieldName}:`, error)
              throw new Error(`Failed to upload ${file.name}`)
            }
          }
        }

        setState({ isUploading: false, error: null, progress: 100 })
        options?.onUploadComplete?.(urls)
        return urls
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload"
        setState({ isUploading: false, error: errorMessage, progress: 0 })
        options?.onUploadError?.(errorMessage)
        throw error
      }
    },
    [options],
  )

  return {
    ...state,
    uploadFiles,
    resetUploadState: () => setState({ isUploading: false, error: null, progress: 0 }),
  }
}
