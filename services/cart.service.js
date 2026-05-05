import api from "./api";

export const addCartItem = ({ productId, packSize, quantity }) => {
  return api.post("/api/v1/cart/items", { productId, packSize, quantity });
};

export const getCart = () => {
  return api.get("/api/v1/cart");
};

export const clearCart = () => {
  return api.delete("/api/v1/cart/clear");
};

export const removeCartItem = async ({ productId, packSize }) => {
  if (!productId) throw new Error("Missing productId");
  const parsedPackSize =
    packSize === undefined || packSize === null ? undefined : Number(packSize);

  try {
    return await api.delete(`/api/v1/cart/items/${productId}`, {
      params:
        parsedPackSize === undefined || Number.isNaN(parsedPackSize)
          ? undefined
          : { packSize: parsedPackSize },
    });
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404 && status !== 405) throw err;
  }

  // Fallback: some APIs accept DELETE body instead of a param.
  return api.delete("/api/v1/cart/items", {
    data: {
      productId,
      ...(parsedPackSize === undefined || Number.isNaN(parsedPackSize)
        ? {}
        : { packSize: parsedPackSize }),
    },
  });
};

export const updateCartItemQuantity = async ({ productId, packSize, quantity }) => {
  if (!productId) throw new Error("Missing productId");

  const payload = { quantity, packSize };

  // Try the most common REST shapes first.
  try {
    return await api.patch(`/api/v1/cart/items/${productId}`, payload);
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404 && status !== 405) throw err;
  }

  try {
    return await api.put(`/api/v1/cart/items/${productId}`, payload);
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404 && status !== 405) throw err;
  }

  throw new Error("Cart quantity update endpoint not available");
};

export const decrementCartItem = async ({ productId, packSize }) => {
  if (!productId) throw new Error("Missing productId");

  // Most compatible: reuse add endpoint as a delta (if supported).
  try {
    return await addCartItem({ productId, packSize, quantity: -1 });
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 400 && status !== 404 && status !== 405) throw err;
  }

  // Other common shapes.
  try {
    return await api.patch(`/api/v1/cart/items/${productId}`, { quantity: -1 });
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 404 && status !== 405) throw err;
  }

  return api.patch(`/api/v1/cart/items/${productId}/decrement`, {});
};
