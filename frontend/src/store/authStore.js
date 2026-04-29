import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setAuth: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken }),

  setTokens: (accessToken, refreshToken) =>
    set({
      accessToken,
      refreshToken: refreshToken ?? get().refreshToken,
    }),

  updateUser: (user) => set({ user }),

  logout: () =>
    set({ user: null, accessToken: null, refreshToken: null }),

  isAuthenticated: () => Boolean(get().accessToken),
}));
