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
      create: async (data) => {
        try {
          console.log("Creating supplier with data:", data);
          const response = await createSupplier(data);
          if (response.error) {
            throw new Error(response.error);
          }
          set((state) => ({ items: [...state.items, response.data] }));
          return true;
        } catch (error) {
          console.error("Create error:", error);
          throw error;
        }
      },
      update: async (id, data) => {
        try {
          const response = await updateSupplier(id, data);
          if (response.error) {
            throw new Error(response.error);
          }
          set((state) => ({
            items: state.items.map((item) => (item.supplierId === id ? response.data : item)),
          }));
          return true;
        } catch (error) {
          console.error("Update error:", error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          const response = await deleteSupplier(id);
          if (response.error) {
            throw new Error(response.error);
          }
          set((state) => ({
            items: state.items.filter((item) => item.supplierId !== id),
          }));
          return true;
        } catch (error) {
          console.error("Delete error:", error);
          throw error;
        }
      },
    }),
    { name: "supplier-store" }
  )
);

// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"


// export const useSupplierStore = create()(
//   devtools(
//     createBaseStore({
//       endpoint: "/api/suppliers",
//       entityName: "suppliers",
//       idField: "supplierId",
//     }),
//     { name: "supplier-store" },
//   ),
// )

