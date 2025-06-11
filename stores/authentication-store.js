

import { create } from "zustand";
import { getAuthRecords, createAuthRecord, updateAuthRecord, deleteAuthRecord } from "@/actions/auth";


export const useAuthenticationStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAuthRecords();
      if (response.error) {
        throw new Error(response.error);
      }
      set({ items: Array.isArray(response.data) ? response.data : [], isLoading: false });
    } catch (error) {
      set({ error: error.message || "Failed to fetch auth records", isLoading: false });
    }
  },
  create: async (formData) => {
    try {
      console.log("Creating auth record with data:", Object.fromEntries(formData));
      const response = await createAuthRecord(formData);
      if (response.error) {
        throw new Error(response.error);
      }
      set((state) => ({ items: [...state.items, response.data] }));
      return true;
    } catch (error) {
      console.error("Create error:", error);
      throw error;
    }
  },
  update: async (id, formData) => {
    try {
      const response = await updateAuthRecord(id, formData);
      if (response.error) {
        throw new Error(response.error);
      }
      set((state) => ({
        items: state.items.map((item) => (item.authId === id ? response.data : item)),
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await deleteAuthRecord(id);
      if (response.error) {
        throw new Error(response.error);
      }
      set((state) => ({
        items: state.items.filter((item) => item.authId !== id),
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },
}));
