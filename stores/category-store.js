// stores/category-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/actions/categories";


export const useCategoryStore = create()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,

      fetch: async () => {
        set({ isLoading: true, error: null });
        const result = await fetchCategories();
        if (result.success) {
          set({ items: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },

      create: async (data, file) => {
        set({ isLoading: true, error: null });
        const result = await createCategory(data, file);
        if (result.success) {
          set((state) => ({
            items: [...state.items, result.data],
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },

      update: async (id, data) => {
        set({ isLoading: true, error: null });
        const result = await updateCategory(id, data);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) =>
              item.categoryId === id ? result.data : item
            ),
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
        const result = await deleteCategory(id);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.categoryId !== id),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "category-store" }
  )
);

// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"
// import type { BaseStore } from "@/types/store-types"
// import { Category } from "@/lib/generated/prisma"



// export interface {
//   categoryName
//   categoryCode?
//   picture?
//   memo?: string
// }

// export type CategoryStore = BaseStore<Category,>

// export const useCategoryStore = create<CategoryStore>()(
//   devtools(
//     createBaseStore<Category,>({
//       endpoint: "/api/categories",
//       entityName: "categories",
//       idField: "categoryId",
//     }),
//     { name: "category-store" },
//   ),
// )
