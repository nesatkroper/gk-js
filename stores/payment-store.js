import { create } from "zustand"



export const usePaymentStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/payments")
      if (!response.ok) throw new Error("Failed to fetch payments")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.payments || [], isLoading: false })
    } catch (error) {
      set({ error: error.message || "Failed to fetch payments", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create payment")
      }
      const newPayment = await response.json()
      set((state) => ({ items: [...state.items, newPayment] }))
      return true
    } catch (error) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update payment")
      }
      const updatedPayment = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.paymentId === id ? updatedPayment : item)),
      }))
      return true
    } catch (error) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete payment")
      set((state) => ({
        items: state.items.filter((item) => item.paymentId !== id),
      }))
      return true
    } catch (error) {
      throw error
    }
  },
}))
