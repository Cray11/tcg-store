import api from "./axios";

export const paymentsAPI = {
  prepareDemoPayment: (orderId) =>
    api.post("/payments/prepare/", { order_id: orderId }),
  completeDemoPayment: (orderId) =>
    api.post("/payments/complete/", { order_id: orderId }),
};
