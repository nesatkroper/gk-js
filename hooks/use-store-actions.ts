"use client"

import { useCallback } from "react"

export function useStoreActions<T extends { clearError: () => void; fetch: () => Promise<void> }>(store: T) {
  const refreshData = useCallback(async () => {
    store.clearError()
    await store.fetch()
  }, [store])

  const handleError = useCallback((error: unknown) => {
    console.error("Store operation failed:", error)
  }, [])

  return {
    refreshData,
    handleError,
  }
}
