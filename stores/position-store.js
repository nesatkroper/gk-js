import { create } from 'zustand'
import { createPosition, updatePosition, deletePosition, getAllPositions } from '@/app/actions/positions'

export const usePositionStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const { success, positions, error } = await getAllPositions()
      if (!success) {
        throw new Error(error || 'Failed to fetch positions')
      }
      set({ items: positions, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  create: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const { success, position, error } = await createPosition(data)
      if (!success) {
        throw new Error(error || 'Failed to create position')
      }
      set((state) => ({
        items: [...state.items, position],
        isLoading: false,
      }))
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  update: async (positionId, data) => {
    set({ isLoading: true, error: null })
    try {
      const { success, position, error } = await updatePosition(positionId, data)
      if (!success) {
        throw new Error(error || 'Failed to update position')
      }
      set((state) => ({
        items: state.items.map((item) =>
          item.positionId === positionId ? position : item
        ),
        isLoading: false,
      }))
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  delete: async (positionId) => {
    set({ isLoading: true, error: null })
    try {
      const { success, error } = await deletePosition(positionId)
      if (!success) {
        throw new Error(error || 'Failed to delete position')
      }
      set((state) => ({
        items: state.items.filter((item) => item.positionId !== positionId),
        isLoading: false,
      }))
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },
}))