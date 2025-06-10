import { clearAuthData, getAuthData, storeAuthData } from "@/lib/auth-utils";
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export const useAuthStore = create()(
  devtools(
    (set, get) => ({
      me: getAuthData(),
      isLoadingMe: false,
      meError: null,
      hasFetched: false,

      fetch: async () => {
        const { isLoadingMe, me, hasFetched } = get();
        if (isLoadingMe || me || hasFetched) return;

        set({ isLoadingMe: true, meError: null });

        try {
          const response = await fetch('/api/auth/me');
          if (!response.ok) throw new Error('Failed to get auth.');

          const data = await response.json();
          const userData = data.user || data;

          set({ me: userData, isLoadingMe: false, hasFetched: true });
          storeAuthData(userData);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch auth';
          set({ meError: errorMessage, isLoadingMe: false, hasFetched: true });
        }
      },
      clearMeError: () => {
        set({ meError: null });
      },

      clearAuth: () => {
        set({ me: null, meError: null });
        clearAuthData();
      },
    }),
    { name: 'auth-store' },
  ),
);
