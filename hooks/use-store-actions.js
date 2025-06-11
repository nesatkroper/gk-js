"use client"

import { useCallback } from "react"

export function useStoreActions(store) {
  const refreshData = useCallback(async () => {
    store.clearError()
    await store.fetch()
  }, [store])

  const handleError = useCallback((error) => {
    console.error("Store operation failed:", error)
  }, [])

  return {
    refreshData,
    handleError,
  }
}
