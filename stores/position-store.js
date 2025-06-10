import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"


export const usePositionStore = create()(
  devtools(
    createBaseStore({
      endpoint: "/api/positions",
      entityName: "positions",
      idField: "positionId",
    }),
    { name: "position-store" },
  ),
)




// import { Position } from "@/lib/generated/prisma"
// import { create } from "zustand"

// export interface PositionStore {
//   items: Position[]
//   isLoading: boolean
//   error: string | null
//   fetch: () => Promise<void>
//   create: (data: Partial<Position>) => Promise<boolean>
//   update: (id: string, data: Partial<Position>) => Promise<boolean>
//   delete: (id: string) => Promise<boolean>
// }

// export const usePositionStore = create<PositionStore>((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/positions")
//       if (!response.ok) throw new Error("Failed to fetch positions")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.positions || [], isLoading: false })
//     } catch (error) {
//       set({ error: error.message, isLoading: false })
//     }
//   },
//   create: async (data) => {
//     try {
//       const response = await fetch("/api/positions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) throw new Error("Failed to create position")
//       const newPosition = await response.json()
//       set((state) => ({ items: [...state.items, newPosition] }))
//       return true
//     } catch (error) {
//       console.error("Create position error:", error)
//       return false
//     }
//   },
//   update: async (id, data) => {
//     try {
//       const response = await fetch(`/api/positions/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) throw new Error("Failed to update position")
//       const updatedPosition = await response.json()
//       set((state) => ({
//         items: state.items.map((item) =>
//           item.positionId === id ? updatedPosition : item,
//         ),
//       }))
//       return true
//     } catch (error) {
//       console.error("Update position error:", error)
//       return false
//     }
//   },
//   delete: async (id) => {
//     try {
//       const response = await fetch(`/api/positions/${id}`, {
//         method: "DELETE",
//       })
//       if (!response.ok) throw new Error("Failed to delete position")
//       set((state) => ({
//         items: state.items.filter((item) => item.positionId !== id),
//       }))
//       return true
//     } catch (error) {
//       console.error("Delete position error:", error)
//       return false
//     }
//   },
// }))
