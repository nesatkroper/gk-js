import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { clearAuthData, getAuthData, storeAuthData } from "@/lib/auth-utils";
import { getCurrentAuthUser, getAuthRecords } from "@/app/actions/auth";

export const useAuthStore = create()(
  devtools(
    (set, get) => ({
      items: getAuthData(),
      loading: false,
      error: null,
      fetched: false,

      fetch: async (options = {}) => {
        const { minimal = false } = options;
        const { loading, items, fetched } = get();
        
        if (loading || (items && fetched)) return;

        set({ loading: true, error: null });

        try {
          const userData = await getCurrentAuthUser();
          
          if (minimal) {
            // If minimal data requested, we already get minimal data from getCurrentAuthUser
            set({ items: userData, loading: false, fetched: true });
            storeAuthData(userData);
          } else {
            // If full data requested, fetch it separately
            const { data, error } = await getAuthRecords({
              type: "byId",
              authId: userData.authId,
            });
            
            if (error) throw new Error(error);
            
            set({ items: data, loading: false, fetched: true });
            storeAuthData(data);
          }
        } catch (error) {
          const errorMessage = error.message || "Failed to fetch auth data";
          set({ error: errorMessage, loading: false, fetched: true });
        }
      },

      fetchById: async (authId) => {
        set({ loading: true, error: null });

        try {
          const { data, error } = await getAuthRecords({
            type: "byId",
            authId,
          });

          if (error) throw new Error(error);

          set({ loading: false });
          return data;
        } catch (error) {
          const errorMessage = error.message || "Failed to fetch auth by ID";
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      clearMeError: () => {
        set({ error: null });
      },

      clearAuth: () => {
        set({ items: null, error: null, fetched: false });
        clearAuthData();
      },
    }),
    { name: "auth-store" }
  )
);


