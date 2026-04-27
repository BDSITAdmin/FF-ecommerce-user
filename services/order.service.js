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

export const cancelOrder = async (orderId) => {
  const path = `/api/v1/orders/${orderId}/cancel`;

  try {
    return await api.patch(path);
  } catch (error) {
    const status = error?.response?.status;

    if (status === 404 || status === 405) {
      return api.post(path);
    }

    throw error;
  }
};

export const getShipmentById = (shipmentId) => {
  return api.get(`/api/v1/shipments/${shipmentId}`);
};

export const downloadOrderInvoice = (orderId) => {
  return api.get(`/api/v1/orders/${orderId}/invoice/download`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });
};

export const extractOrderFromResponse = (res) => {
  return res?.data?.data?.order ?? res?.data?.order ?? res?.data?.data ?? null;
};