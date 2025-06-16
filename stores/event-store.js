import { create } from 'zustand'
import { createEvent, updateEvent, deleteEvent, getAllEvents } from '@/app/actions/events'

export const useEventStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const { success, events, error } = await getAllEvents()
      if (!success) {
        throw new Error(error || 'Failed to fetch events')
      }
      set({ items: events, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  create: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const { success, event, error } = await createEvent(data)
      if (!success) {
        throw new Error(error || 'Failed to create event')
      }
      set((state) => ({
        items: [...state.items, event],
        isLoading: false,
      }))
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  update: async (eventId, data) => {
    set({ isLoading: true, error: null })
    try {
      const { success, event, error } = await updateEvent(eventId, data)
      if (!success) {
        throw new Error(error || 'Failed to update event')
      }
      set((state) => ({
        items: state.items.map((item) =>
          item.eventId === eventId ? event : item
        ),
        isLoading: false,
      }))
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  delete: async (eventId) => {
    set({ isLoading: true, error: null })
    try {
      const { success, error } = await deleteEvent(eventId)
      if (!success) {
        throw new Error(error || 'Failed to delete event')
      }
      set((state) => ({
        items: state.items.filter((item) => item.eventId !== eventId),
        isLoading: false,
      }))
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },
}))
