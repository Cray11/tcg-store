import api from "./axios";

export const paymentsAPI = {
  createPaymentIntent: (orderId) =>
    api.post("/payments/create-intent/", { order_id: orderId }),
  simulatePaymentSuccess: (orderId) =>
    api.post("/payments/simulate-success/", { order_id: orderId }),
};
