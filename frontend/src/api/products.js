import api from "./axios";

export const productsAPI = {
  getProducts: (params) => api.get("/products/", { params }),
  getProduct: (slug) => api.get(`/products/${slug}/`),
  getCategories: () => api.get("/categories/"),
  getFeatured: () => api.get("/products/featured/"),
};