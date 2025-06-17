// // stores/product-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchProduct, createProduct, updateProduct, deleteProduct } from "@/app/actions/products";



export const useProductStore = create()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      fetch: async (options = {}) => {
        set({ isLoading: true, error: null });
        const result = await fetchProduct(options);
        if (result.success) {
          set({ items: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },
      create: async (data, file) => {
        set({ isLoading: true, error: null });
        const result = await createProduct(data, file);
        if (result.success) {
          set((state) => ({ items: [...state.items, result.data], isLoading: false }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
      update: async (id, data, file) => {
        set({ isLoading: true, error: null });
        const result = await updateProduct(id, data, file);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) => (item.productId === id ? result.data : item)),
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
        const result = await deleteProduct(id);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.productId !== id),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "productStore" }
  )
);

