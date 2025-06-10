// stores/stock-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchStockEntries, createStockEntry, updateStockEntry, deleteStockEntry, CreateStockData } from "@/actions/stock";

export const useStockStore = create()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      fetch: async (params = {}) => {
        set({ isLoading: true, error: null });
        const result = await fetchStockEntries(params);
        if (result.success) {
          set({ items: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },
      create: async (data) => {
        set({ isLoading: true, error: null });
        const result = await createStockEntry(data);
        if (result.success) {
          set((state) => ({ items: [...state.items, result.data], isLoading: false }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
      update: async (id, data) => {
        set({ isLoading: true, error: null });
        const result = await updateStockEntry(id, data);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) => (item.entryId === id ? result.data : item)),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
      delete: async (id) => {
        set({ isLoading: true, error: null });
        const result = await deleteStockEntry(id);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.entryId !== id),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "stockStore" }
  )
);


// import { create } from "zustand";

// interface StockEntry {
//   entryId;
//   productId;
//   supplierId: string;
//   quantity: number;
//   entryPrice: number;
//   entryDate?: string | null;
//   invoice?: string | null;
//   memo?: string | null;
//   status: "active" | "inactive";
//   createdAt: string;
//   updatedAt: string;
//   Product?: { productId: string; productName: string; productCode: string | null } | null;
//   Supplier?: { supplierId: string; name: string } | null;
// }

// interface StockStore {
//   items: StockEntry[];
//   isLoading: boolean;
//   error: string | null;
//   fetch: (params?: { page?: number; limit?: number; search?: string; lowStock?: boolean }) => Promise<void>;
//   create: (data: Partial<StockEntry>) => Promise<boolean>;
//   update: (id: string, data: Partial<StockEntry>) => Promise<boolean>;
//   delete: (id: string) => Promise<boolean>;
// }

// export const useStockStore = create<StockStore>((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async (params = {}) => {
//     set({ isLoading: true, error: null });
//     try {
//       const { page = 1, limit = 10, search = "", lowStock = false } = params;
//       const query = new URLSearchParams({
//         page: page.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(lowStock && { lowStock: "true" }),
//       }).toString();

//       const response = await fetch(`/api/stockentries?${query}`);
//       if (!response.ok) throw new Error("Failed to fetch stock entries");
//       const data = await response.json();
//       set({
//         items: Array.isArray(data.stockEntries) ? data.stockEntries : [],
//         isLoading: false,
//       });
//     } catch (error: any) {
//       set({ error: error.message || "Failed to fetch stock entries", isLoading: false });
//     }
//   },
//   create: async (data) => {
//     try {
//       const response = await fetch("/api/stockentries", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to create stock entry");
//       }
//       const newEntry = await response.json();
//       set((state) => ({ items: [...state.items, newEntry] }));
//       return true;
//     } catch (error: any) {
//       throw error;
//     }
//   },
//   update: async (id, data) => {
//     try {
//       const response = await fetch(`/api/stockentries/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update stock entry");
//       }
//       const updatedEntry = await response.json();
//       set((state) => ({
//         items: state.items.map((item) => (item.entryId === id ? updatedEntry : item)),
//       }));
//       return true;
//     } catch (error: any) {
//       throw error;
//     }
//   },
//   delete: async (id) => {
//     try {
//       const response = await fetch(`/api/stockentries/${id}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to delete stock entry");
//       }
//       set((state) => ({
//         items: state.items.filter((item) => item.entryId !== id),
//       }));
//       return true;
//     } catch (error: any) {
//       throw error;
//     }
//   },
// }));