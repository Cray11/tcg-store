import { create } from "zustand";

export const useUIStore = create((set) => ({
  toasts: [],
  cartDrawer: false,
  pageLoading: false,
  checkoutDraft: {
    addressId: "",
    customerNote: "",
    shippingMethod: "STANDARD",
    promoCode: "",
    orderId: "",
  },

  addToast: (message, type = "success") => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setPageLoading: (pageLoading) => set({ pageLoading }),

  toggleCartDrawer: () =>
    set((state) => ({ cartDrawer: !state.cartDrawer })),

  closeCartDrawer: () => set({ cartDrawer: false }),

  setCheckoutDraft: (updates) =>
    set((state) => ({
      checkoutDraft: {
        ...state.checkoutDraft,
        ...updates,
      },
    })),

  resetCheckoutDraft: () =>
    set({
      checkoutDraft: {
        addressId: "",
        customerNote: "",
        shippingMethod: "STANDARD",
        promoCode: "",
        orderId: "",
      },
    }),
}));
