import api from "./api";

export const createOrder = (data) => {
  return api.post("/api/v1/orders", data);
};

export const getOrders = ({ page = 1, limit = 10 } = {}) => {
  return api.get("/api/v1/orders", {
    params: { page, limit },
  });
};

export const getOrderById = (orderId) => {
  return api.get(`/api/v1/orders/${orderId}`);
};

export const extractOrderFromResponse = (res) => {
  return res?.data?.data?.order ?? res?.data?.order ?? res?.data?.data ?? null;
};