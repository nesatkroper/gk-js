// stores/brand-store.ts (unchanged)
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchBrands, createBrand, updateBrand, deleteBrand, CreateBrandData } from "@/actions/brands";


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


// import { create } from "zustand"

// interface Brand {
//   brandId: string
//   brandName: string
//   brandCode?: string | null
//   picture?: string | null
//   memo?: string | null
//   status: "active" | "inactive"
//   createdAt: string
//   updatedAt: string
// }

// interface BrandStore {
//   items: Brand[]
//   isLoading: boolean
//   error: string | null
//   fetch: () => Promise<void>
//   create: (data: Partial<Brand>) => Promise<boolean>
//   update: (id: string, data: Partial<Brand>) => Promise<boolean>
//   delete: (id: string) => Promise<boolean>
// }

// export const useBrandStore = create<BrandStore>((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/brands")
//       if (!response.ok) throw new Error("Failed to fetch brands")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.brands || [], isLoading: false })
//     } catch (error: any) {
//       set({ error: error.message || "Failed to fetch brands", isLoading: false })
//     }
//   },
//   create: async (data) => {
//     try {
//       const response = await fetch("/api/brands", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//         cache: 'no-store'
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to create brand")
//       }
//       const newBrand = await response.json()
//       set((state) => ({ items: [...state.items, newBrand] }))
//       return true
//     } catch (error: any) {
//       throw error
//     }
//   },
//   update: async (id, data) => {
//     try {
//       const response = await fetch(`/api/brands/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to update brand")
//       }
//       const updatedBrand = await response.json()
//       set((state) => ({
//         items: state.items.map((item) => (item.brandId === id ? updatedBrand : item)),
//       }))
//       return true
//     } catch (error: any) {
//       throw error
//     }
//   },
//   delete: async (id) => {
//     try {
//       const response = await fetch(`/api/brands/${id}`, {
//         method: "DELETE",
//       })
//       if (!response.ok) throw new Error("Failed to delete brand")
//       set((state) => ({
//         items: state.items.filter((item) => item.brandId !== id),
//       }))
//       return true
//     } catch (error: any) {
//       throw error
//     }
//   },
// }))