import api from "./axios";

export const ordersAPI = {
  createOrder: (data) => api.post("/orders/create/", data),
  getOrders: () => api.get("/orders/"),
  getOrder: (id) => api.get(`/orders/${id}/`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel/`),
};