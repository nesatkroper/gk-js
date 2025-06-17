import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/app/actions/supplier";

export const useSupplierStore = create(
  devtools(
    (set) => ({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
      isLoading: false,
      error: null,
      fetch: async ({ page = 1, limit = 10, search = "", includeInactive = false } = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getSuppliers({ page, limit, search, includeInactive });
          if (response.error) {
            throw new Error(response.error);
          }
          set({
            items: Array.isArray(response.data.suppliers) ? response.data.suppliers : [],
            pagination: response.data.pagination,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message || "Failed to fetch suppliers", isLoading: false });
        }
      },
    }),
    { name: "supplier-store" }
  )
);
