import { create } from "zustand"


export const useCountStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getTableCount()
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.count || [], isLoading: false })
    } catch (error) {
      set({ error: error.message || "Failed to fetch brands", isLoading: false })
    }
  },
}))