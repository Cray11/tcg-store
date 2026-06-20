import api from "./axios";

export const wishlistAPI = {
  getWishlist: () => api.get("/auth/wishlist/"),
  addToWishlist: (productId) => api.post("/auth/wishlist/", { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/auth/wishlist/${productId}/`),
};
