import { create } from 'zustand'
import { createRole, updateRole, deleteRole, getAllRoles } from '@/app/actions/roles'

export const useRoleStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const { success, roles, error } = await getAllRoles()
      if (!success) {
        throw new Error(error || 'Failed to fetch roles')
      }
      set({ items: roles, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  create: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const { success, role, error } = await createRole(data)
      if (!success) {
        throw new Error(error || 'Failed to create role')
      }
      set((state) => ({
        items: [...state.items, role],
        isLoading: false,
      }))
      return { success: true, error: null }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  update: async (roleId, data) => {
    set({ isLoading: true, error: null })
    try {
      const { success, role, error } = await updateRole(roleId, data)
      if (!success) {
        throw new Error(error || 'Failed to update role')
      }
      set((state) => ({
        items: state.items.map((item) =>
          item.roleId === roleId ? role : item
        ),
        isLoading: false,
      }))
      return { success: true, error: null }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  delete: async (roleId) => {
    set({ isLoading: true, error: null })
    try {
      const { success, error } = await deleteRole(roleId)
      if (!success) {
        throw new Error(error || 'Failed to delete role')
      }
      set((state) => ({
        items: state.items.filter((item) => item.roleId !== roleId),
        isLoading: false,
      }))
      return { success: true, error: null }
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },
}))