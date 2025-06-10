import { create } from "zustand"


export const useAddressStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/addresses")
      if (!response.ok) throw new Error("Failed to fetch addresses")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.addresses || [], isLoading: false })
    } catch (error) {
      set({ error: error.message || "Failed to fetch addresses", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create address")
      }
      const newAddress = await response.json()
      set((state) => ({ items: [...state.items, newAddress] }))
      return true
    } catch (error) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update address")
      }
      const updatedAddress = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.addressId === id ? updatedAddress : item)),
      }))
      return true
    } catch (error) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete address")
      set((state) => ({
        items: state.items.filter((item) => item.addressId !== id),
      }))
      return true
    } catch (error) {
      throw error
    }
  },
}))
