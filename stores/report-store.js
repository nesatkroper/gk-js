import { create } from "zustand"



export const useReportStore = create  ((set) => ({
  salesReport: null,
  inventoryReport: null,
  isLoading: false,
  error: null,
  fetchReports: async (startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      // Fetch sales report
      const salesUrl = `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`
      const salesResponse = await fetch(salesUrl)
      if (!salesResponse.ok) throw new Error("Failed to fetch sales report")
      const salesData = await salesResponse.json()

      // Fetch inventory report
      const inventoryResponse = await fetch("/api/reports/inventory")
      if (!inventoryResponse.ok) throw new Error("Failed to fetch inventory report")
      const inventoryData = await inventoryResponse.json()

      set({
        salesReport: salesData,
        inventoryReport: inventoryData,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error.message || "Failed to fetch reports",
        isLoading: false,
        salesReport: null,
        inventoryReport: null,
      })
    }
  },
  clearError: () => set({ error: null }),
}))