import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,       // access token — in memory only, NOT persisted
      initialized: false, // false until refresh-on-load attempt completes
      setUser: (user, token) => set({ user, token, initialized: true }),
      setToken: (token) => set({ token }),
      setInitialized: () => set({ initialized: true }),
      logout: () => set({ user: null, token: null, initialized: true }),
    }),
    {
      name: 'auth-storage',
      // Only persist the user object for UI — token stays in memory only
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
