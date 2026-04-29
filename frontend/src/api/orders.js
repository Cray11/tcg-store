import api from "./axios";

export const ordersAPI = {
  createOrder: (data) => api.post("/orders/create/", data),
  getOrders: (params) => api.get("/orders/", { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel/`),
};
