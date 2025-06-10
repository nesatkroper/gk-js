import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"




export const useLeaveRequestStore = create()(
  devtools(
    (set, get) => ({
      ...createBaseStore({
        endpoint: "/api/leave-requests",
        entityName: "leaveRequests",
        idField: "leaveId",
      })(set, get),

      // Additional state
      pendingRequests: [],
      employeeRequests: [],
      isLoadingPendingRequests: false,
      isLoadingEmployeeRequests: false,
      pendingRequestsError: null,
      employeeRequestsError: null,

      // Custom methods
      approveLeaveRequest: async (leaveId, data) => {
        set({ isUpdating: true, error: null })

        try {
          const response = await fetch(`/api/leave-requests/${leaveId}/approve`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              approvedAt: new Date(),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to approve leave request")
          }

          const updatedRequest = await response.json()

          // Update in all relevant lists
          set((state) => ({
            items: state.items.map((item) => (item.leaveId === leaveId ? updatedRequest : item)),
            pendingRequests: state.pendingRequests.filter((item) => item.leaveId !== leaveId),
            employeeRequests: state.employeeRequests.map((item) => (item.leaveId === leaveId ? updatedRequest : item)),
            isUpdating: false,
          }))

          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isUpdating: false,
          })
          return false
        }
      },

      cancelLeaveRequest: async (leaveId) => {
        set({ isUpdating: true, error: null })

        try {
          const response = await fetch(`/api/leave-requests/${leaveId}/cancel`, {
            method: "PUT",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to cancel leave request")
          }

          const updatedRequest = await response.json()

          // Update in all relevant lists
          set((state) => ({
            items: state.items.map((item) => (item.leaveId === leaveId ? updatedRequest : item)),
            pendingRequests: state.pendingRequests.filter((item) => item.leaveId !== leaveId),
            employeeRequests: state.employeeRequests.map((item) => (item.leaveId === leaveId ? updatedRequest : item)),
            isUpdating: false,
          }))

          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isUpdating: false,
          })
          return false
        }
      },

      fetchPendingRequests: async () => {
        set({ isLoadingPendingRequests: true, pendingRequestsError: null })

        try {
          const response = await fetch("/api/leave-requests/pending")
          if (!response.ok) throw new Error("Failed to fetch pending leave requests")

          const data = await response.json()
          const requests = Array.isArray(data) ? data : data.requests || []

          set({ pendingRequests: requests, isLoadingPendingRequests: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            pendingRequestsError: errorMessage,
            isLoadingPendingRequests: false,
          })
        }
      },

      fetchEmployeeRequests: async (employeeId) => {
        set({ isLoadingEmployeeRequests: true, employeeRequestsError: null })

        try {
          const response = await fetch(`/api/employees/${employeeId}/leave-requests`)
          if (!response.ok) throw new Error("Failed to fetch employee leave requests")

          const data = await response.json()
          const requests = Array.isArray(data) ? data : data.requests || []

          set({ employeeRequests: requests, isLoadingEmployeeRequests: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            employeeRequestsError: errorMessage,
            isLoadingEmployeeRequests: false,
          })
        }
      },
    }),
    { name: "leave-request-store" },
  ),
)
