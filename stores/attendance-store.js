import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"




export const useAttendanceStore = create()(
  devtools(
    (set, get) => ({
      ...createBaseStore({
        endpoint: "/api/attendances",
        entityName: "attendances",
        idField: "attendanceId",
      })(set, get),

      checkIn: async (employeeId, eventId, note) => {
        set({ isCreating: true, error: null })

        try {
          const response = await fetch("/api/attendances/check-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId,
              eventId,
              note,
              checkIn: new Date(),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to check in")
          }

          const newAttendance = await response.json()

          set((state) => ({
            items: [newAttendance, ...state.items],
            isCreating: false,
          }))

          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isCreating: false,
          })
          return false
        }
      },

      // Custom method for check-out
      checkOut: async (attendanceId) => {
        set({ isUpdating: true, error: null })

        try {
          const response = await fetch(`/api/attendances/${attendanceId}/check-out`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkOut: new Date(),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to check out")
          }

          const updatedAttendance = await response.json()

          set((state) => ({
            items: state.items.map((item) => (item.attendanceId === attendanceId ? updatedAttendance : item)),
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
    }),
    { name: "attendance-store" },
  ),
)
