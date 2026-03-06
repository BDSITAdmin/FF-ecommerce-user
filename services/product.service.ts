import api from "./api";

export const getProducts = async (params?: any) => {
  const res = await api.get("/api/v1/products", {
    params,
  });

  return res.data?.data?.products ?? [];
};