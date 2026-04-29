import api from "./axios";

export const productsAPI = {
  getProducts: (params) => api.get("/products/", { params }),
  getProduct: (slug) => api.get(`/products/${slug}/`),
  getCategories: (params) => api.get("/categories/", { params }),
  getFeatured: (params) => api.get("/products/featured/", { params }),
};
