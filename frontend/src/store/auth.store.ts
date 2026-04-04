import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserType = 'seller' | 'customer';

interface AuthStore {
  accessToken: string | null;
  userType: UserType | null;
  userId: string | null;
  _hasHydrated: boolean;
  setAuth: (token: string, userType: UserType, userId: string) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      userType: null,
      userId: null,
      _hasHydrated: false,
      setAuth: (token, userType, userId) =>
        set({ accessToken: token, userType, userId }),
      setAccessToken: (token) => set({ accessToken: token }),
      clear: () => set({ accessToken: null, userType: null, userId: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
