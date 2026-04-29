import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: null,
  itemCount: 0,
  subtotal: 0,

  setCart: (cart) =>
    set({
      cart,
      itemCount: cart?.total_items ?? 0,
      subtotal: Number(cart?.subtotal ?? 0),
    }),

  clearCart: () => set({ cart: null, itemCount: 0, subtotal: 0 }),
}));
