import { Branch } from "@/lib/generated/prisma"
import { create } from "zustand"



export const useBranchStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/branches")
      if (!response.ok) throw new Error("Failed to fetch branches")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.branches || [], isLoading: false })
    } catch (error) {
      set({ error: error.message || "Failed to fetch branches", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create branch")
      }
      const newBranch = await response.json()
      set((state) => ({ items: [...state.items, newBranch] }))
      return true
    } catch (error) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update branch")
      }
      const updatedBranch = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.branchId === id ? updatedBranch : item)),
      }))
      return true
    } catch (error) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete branch")
      set((state) => ({
        items: state.items.filter((item) => item.branchId !== id),
      }))
      return true
    } catch (error) {
      throw error
    }
  },
}))