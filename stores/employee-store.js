import { create } from "zustand"
import { getEmployees, deleteEmployee } from "@/app/actions/employees"

export const useEmployeeStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async (option) => {
    set({ isLoading: true, error: null })
    try {
      const result = await getEmployees(option)
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ items: result.employees || [], isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      set({ error: errorMessage, isLoading: false, items: [] })
    }
  },

  delete: async (employeeId) => {
    try {
      const result = await deleteEmployee(employeeId)
      if (!result.success) {
        throw new Error(result.error)
      }
      set((state) => ({
        items: state.items.filter((item) => item.employeeId !== employeeId),
      }))
    } catch (error) {
      throw error
    }
  },
}))




// import { create } from "zustand"
// import { getEmployees, deleteEmployee } from "@/app/actions/employees"

// export const useEmployeeStore = create((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,

//   fetch: async (option) => {
//     set({ isLoading: true, error: null })
//     try {
//       const result = await getEmployees(option)
//       if (!result.success) {
//         throw new Error(result.error)
//       }
//       set({ items: result.employees, isLoading: false })
//     } catch (error) {
//       set({ error: error.message, isLoading: false })
//     }
//   },

//   delete: async (employeeId) => {
//     try {
//       const result = await deleteEmployee(employeeId)
//       if (!result.success) {
//         throw new Error(result.error)
//       }
//       set((state) => ({
//         items: state.items.filter((item) => item.employeeId !== employeeId),
//       }))
//     } catch (error) {
//       throw error
//     }
//   },
// }))

