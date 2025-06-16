import { create } from "zustand"
import { fetchStocks, createStock, updateStock, deleteStock } from "@/app/actions/stocks"

export const useStockStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async ({ search = "", lowStock = false } = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { success, stocks, error } = await fetchStocks({ search, lowStock })
      if (!success) throw new Error(error)
      set({ items: stocks, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const { success, stock, error } = await createStock(data)
      if (!success) throw new Error(error)
      set((state) => ({ items: [...state.items, stock] }))
      return true
    } catch (error) {
      console.error("Store create stock error:", error)
      return false
    }
  },
  update: async (stockId, data) => {
    try {
      const { success, stock, error } = await updateStock(stockId, data)
      if (!success) throw new Error(error)
      set((state) => ({
        items: state.items.map((item) =>
          item.stockId === stockId ? stock : item
        ),
      }))
      return true
    } catch (error) {
      console.error("Store update stock error:", error)
      return false
    }
  },
  delete: async (stockId) => {
    try {
      const { success, error } = await deleteStock(stockId)
      if (!success) throw new Error(error)
      set((state) => ({
        items: state.items.filter((item) => item.stockId !== stockId),
      }))
      return true
    } catch (error) {
      console.error("Store delete stock error:", error)
      return false
    }
  },
}))


// // stores/stock-store.ts
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { fetchStockEntries, createStockEntry, updateStockEntry, deleteStockEntry, CreateStockData } from "@/app/actions/stock";

// export const useStockStore = create()(
//   devtools(
//     (set) => ({
//       items: [],
//       isLoading: false,
//       error: null,
//       fetch: async (params = {}) => {
//         set({ isLoading: true, error: null });
//         const result = await fetchStockEntries(params);
//         if (result.success) {
//           set({ items: result.data, isLoading: false });
//         } else {
//           set({ error: result.error, isLoading: false });
//         }
//       },
//       create: async (data) => {
//         set({ isLoading: true, error: null });
//         const result = await createStockEntry(data);
//         if (result.success) {
//           set((state) => ({ items: [...state.items, result.data], isLoading: false }));
//           return true;
//         } else {
//           set({ error: result.error, isLoading: false });
//           return false;
//         }
//       },
//       update: async (id, data) => {
//         set({ isLoading: true, error: null });
//         const result = await updateStockEntry(id, data);
//         if (result.success) {
//           set((state) => ({
//             items: state.items.map((item) => (item.entryId === id ? result.data : item)),
//             isLoading: false,
//           }));
//           return true;
//         } else {
//           set({ error: result.error, isLoading: false });
//           return false;
//         }
//       },
//       delete: async (id) => {
//         set({ isLoading: true, error: null });
//         const result = await deleteStockEntry(id);
//         if (result.success) {
//           set((state) => ({
//             items: state.items.filter((item) => item.entryId !== id),
//             isLoading: false,
//           }));
//           return true;
//         } else {
//           set({ error: result.error, isLoading: false });
//           return false;
//         }
//       },
//     }),
//     { name: "stockStore" }
//   )
// );
