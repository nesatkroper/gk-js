import { create } from "zustand"
import { getCustomers, deleteCustomer } from "@/app/actions/customers"

export const useCustomerStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const result = await getCustomers(params)
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ items: result.customers, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  delete: async (customerId) => {
    try {
      const result = await deleteCustomer(customerId)
      if (!result.success) {
        throw new Error(result.error)
      }
      set((state) => ({
        items: state.items.filter((item) => item.customerId !== customerId),
      }))
    } catch (error) {
      throw error
    }
  },
}))