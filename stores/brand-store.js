
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchBrands, createBrand, updateBrand, deleteBrand } from "@/actions/brands";


export const useBrandStore = create()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      fetch: async () => {
        set({ isLoading: true, error: null });
        const result = await fetchBrands();
        if (result.success) {
          set({ items: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },
      create: async (data, file) => {
        set({ isLoading: true, error: null });
        const result = await createBrand(data, file);
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
        const result = await updateBrand(id, data, file);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) => (item.brandId === id ? result.data : item)),
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
        const result = await deleteBrand(id);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.brandId !== id),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "brandStore" }
  )
);
