import { create } from "zustand"
import { getAllEmployees, deleteEmployee } from "@/app/actions/employees"

export const useEmployeeStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await getAllEmployees()
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ items: result.employees, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
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



// export const useEmployeeStore = create((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/employees")
//       if (!response.ok) throw new Error("Failed to fetch employees")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.employees || [], isLoading: false })
//     } catch (error) {
//       set({ error: error.message || "Failed to fetch employees", isLoading: false })
//     }
//   },
//   create: async (data) => {
//     try {
//       const response = await fetch("/api/employees", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to create employee")
//       }
//       const newEmployee = await response.json()
//       set((state) => ({ items: [...state.items, newEmployee] }))
//       return true
//     } catch (error) {
//       throw error
//     }
//   },
//   update: async (id, data) => {
//     try {
//       const response = await fetch(`/api/employees/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to update employee")
//       }
//       const updatedEmployee = await response.json()
//       set((state) => ({
//         items: state.items.map((item) => (item.employeeId === id ? updatedEmployee : item)),
//       }))
//       return true
//     } catch (error) {
//       throw error
//     }
//   },
//   delete: async (id) => {
//     try {
//       const response = await fetch(`/api/employees/${id}`, {
//         method: "DELETE",
//       })
//       if (!response.ok) throw new Error("Failed to delete employee")
//       set((state) => ({
//         items: state.items.filter((item) => item.employeeId !== id),
//       }))
//       return true
//     } catch (error) {
//       throw error
//     }
//   },
// }))

