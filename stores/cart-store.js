import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"



export const useCartStore = create()(
  devtools(
    (set, get) => ({
      ...createBaseStore({
        endpoint: "/api/carts",
        entityName: "carts",
        idField: "cartId",
      })(set, get),


      cartNotes: [],
      isLoadingCartNotes: false,
      cartNotesError: null,

      // Custom methods
      fetchCartNotes: async (cartId) => {
        set({ isLoadingCartNotes: true, cartNotesError: null })

        try {
          const response = await fetch(`/api/carts/${cartId}/notes`)
          if (!response.ok) throw new Error("Failed to fetch cart notes")

          const data = await response.json()
          const notes = Array.isArray(data) ? data : data.notes || []

          set({ cartNotes: notes, isLoadingCartNotes: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            cartNotesError: errorMessage,
            isLoadingCartNotes: false,
          })
        }
      },

      addCartNote: async (cartId, note) => {
        set({ isCreating: true, error: null })

        try {
          const response = await fetch(`/api/carts/${cartId}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to add cart note")
          }

          const newNote = await response.json()

          set((state) => ({
            cartNotes: [newNote, ...state.cartNotes],
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

      removeCartNote: async (cartnoteId) => {
        set({ isDeleting: true, error: null })

        try {
          const response = await fetch(`/api/cart-notes/${cartnoteId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to remove cart note")
          }

          set((state) => ({
            cartNotes: state.cartNotes.filter((note) => note.cartnoteId !== cartnoteId),
            isDeleting: false,
          }))

          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isDeleting: false,
          })
          return false
        }
      },

      clearCart: async () => {
        set({ isDeleting: true, error: null })

        try {
          const response = await fetch("/api/carts/clear", {
            method: "DELETE",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to clear cart")
          }

          set({ items: [], isDeleting: false })

          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isDeleting: false,
          })
          return false
        }
      },

      incrementQuantity: async (cartId) => {
        set({ isUpdating: true, error: null })

        try {
          const cart = get().items.find((item) => item.cartId === cartId)
          if (!cart) throw new Error("Cart item not found")

          const response = await fetch(`/api/carts/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: cart.quantity + 1 }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to increment quantity")
          }

          const updatedCart = await response.json()

          set((state) => ({
            items: state.items.map((item) => (item.cartId === cartId ? updatedCart : item)),
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

      decrementQuantity: async (cartId) => {
        set({ isUpdating: true, error: null })

        try {
          const cart = get().items.find((item) => item.cartId === cartId)
          if (!cart) throw new Error("Cart item not found")

          if (cart.quantity <= 1) {
            // If quantity is 1 or less, remove the item
            return get().delete(cartId)
          }

          const response = await fetch(`/api/carts/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: cart.quantity - 1 }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to decrement quantity")
          }

          const updatedCart = await response.json()

          set((state) => ({
            items: state.items.map((item) => (item.cartId === cartId ? updatedCart : item)),
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
    { name: "cart-store" },
  ),
)
