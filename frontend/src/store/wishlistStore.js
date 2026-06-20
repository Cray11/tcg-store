import { create } from "zustand";

function removePendingId(pendingIds, productId) {
  const nextPendingIds = { ...pendingIds };
  delete nextPendingIds[productId];
  return nextPendingIds;
}

export const useWishlistStore = create((set, get) => ({
  items: [],
  hasLoaded: false,
  pendingIds: {},

  setWishlist: (items) =>
    set({
      items,
      hasLoaded: true,
    }),

  addItem: (item) =>
    set((state) => {
      const productId = item.product.id;
      const nextItems = state.items.filter((entry) => entry.product.id !== productId);
      return {
        items: [item, ...nextItems],
        hasLoaded: true,
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((entry) => entry.product.id !== productId),
      hasLoaded: true,
    })),

  clearWishlist: () =>
    set({
      items: [],
      hasLoaded: false,
      pendingIds: {},
    }),

  setPending: (productId, pending) =>
    set((state) => ({
      pendingIds: pending
        ? { ...state.pendingIds, [productId]: true }
        : removePendingId(state.pendingIds, productId),
    })),

  isWishlisted: (productId) =>
    get().items.some((entry) => entry.product.id === productId),
}));
