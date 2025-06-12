import { create } from "zustand";
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/app/actions/addresses"; // Adjust the import path as needed

export const useAddressStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  /**
   * Fetches all active addresses from the server and updates the store.
   */
  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getAllAddresses();
      if (result.error) {
        throw new Error(result.error);
      }
      set({ items: result.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Creates a new address via the server action and adds it to the store.
   * @param {object} data - The address data for creation.
   * @returns {Promise<object>} The newly created address object.
   * @throws {Error} If the creation fails.
   */
  create: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createAddress(data);
      if (result.error) {
        throw new Error(result.error);
      }
      // Add the new address to the existing items
      set((state) => ({ items: [...state.items, result.data] }));
      return result.data; // Return the new address on success
    } catch (error) {
      set({ error: error.message });
      // Re-throw the error so the component can catch it (e.g., for toast notifications)
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Updates an existing address via the server action.
   * @param {string|number} id - The ID of the address to update.
   * @param {object} data - The updated address data.
   * @returns {Promise<object>} The updated address object.
   * @throws {Error} If the update fails.
   */
  update: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateAddress(id, data);
      if (result.error) {
        throw new Error(result.error);
      }
      // Find and replace the updated item in the store
      set((state) => ({
        items: state.items.map((item) =>
          item.addressId === id ? result.data : item
        ),
      }));
      return result.data; // Return the updated address on success
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Deletes an address (soft delete) via the server action and removes it from the store.
   * @param {string|number} id - The ID of the address to delete.
   * @returns {Promise<boolean>} True on success.
   * @throws {Error} If the deletion fails.
   */
  delete: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await deleteAddress(id);
      if (result.error) {
        throw new Error(result.error);
      }
      // Filter out the deleted item from the store
      set((state) => ({
        items: state.items.filter((item) => item.addressId !== id),
      }));
      return true;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));


// import { create } from "zustand"


// export const useAddressStore = create((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/addresses")
//       if (!response.ok) throw new Error("Failed to fetch addresses")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.addresses || [], isLoading: false })
//     } catch (error) {
//       set({ error: error.message || "Failed to fetch addresses", isLoading: false })
//     }
//   },
//   create: async (data) => {
//     try {
//       const response = await fetch("/api/addresses", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to create address")
//       }
//       const newAddress = await response.json()
//       set((state) => ({ items: [...state.items, newAddress] }))
//       return true
//     } catch (error) {
//       throw error
//     }
//   },
//   update: async (id, data) => {
//     try {
//       const response = await fetch(`/api/addresses/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to update address")
//       }
//       const updatedAddress = await response.json()
//       set((state) => ({
//         items: state.items.map((item) => (item.addressId === id ? updatedAddress : item)),
//       }))
//       return true
//     } catch (error) {
//       throw error
//     }
//   },
//   delete: async (id) => {
//     try {
//       const response = await fetch(`/api/addresses/${id}`, {
//         method: "DELETE",
//       })
//       if (!response.ok) throw new Error("Failed to delete address")
//       set((state) => ({
//         items: state.items.filter((item) => item.addressId !== id),
//       }))
//       return true
//     } catch (error) {
//       throw error
//     }
//   },
// }))
