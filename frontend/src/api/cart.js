import api from "./axios";

export const cartAPI = {
  getCart: () => api.get("/cart/"),
  addToCart: (productId, quantity = 1) =>
    api.post("/cart/add/", { product_id: productId, quantity }),
  updateItem: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/remove/`),
  clearCart: () => api.post("/cart/clear/"),
};