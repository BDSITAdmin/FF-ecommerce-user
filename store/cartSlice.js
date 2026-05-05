import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  decrementCartItem,
  updateCartItemQuantity,
} from "../services/cart.service";

const getProductId = (product) => {
  if (!product) return null;
  return (
    product.id ??
    product._id ??
    product.productId ??
    product.product_id ??
    product.productID ??
    null
  );
};

const getPackId = (item) => {
  if (!item) return null;
  return item.packId ?? item.pack_id ?? item.pack?.id ?? null;
};

const getPackSize = (item) => {
  if (!item) return null;
  return (
    item.packSize ??
    item.pack_size ??
    item.packQuantity ??
    item.pack?.quantity ??
    item?.CartItem?.packSize ??
    null
  );
};

const normalizeProduct = (product) => {
  if (!product) return null;
  const id = getProductId(product);
  return {
    ...product,
    id,
    packId: getPackId(product),
    packSize: getPackSize(product),
    packQuantity: getPackSize(product) ?? product?.packQuantity,
  };
};

const isSameCartVariant = (item, productId, packId) => {
  const sameProduct = item?.id === productId;
  if (!sameProduct) return false;
  if (packId === undefined) return true;
  return getPackId(item) === packId;
};

const extractCartItems = (res) => {
  const data = res?.data?.data ?? res?.data ?? null;
  if (!data) return [];
  return (
    data.items ??
    data.cart?.items ??
    data.cartItems ??
    data.cart_items ??
    []
  );
};

const extractCartPricing = (res) => {
  const data = res?.data?.data ?? res?.data ?? null;
  const pricing = data?.pricing ?? {};
  return {
    mrp: Number(pricing?.mrp || 0),
    discount: Number(pricing?.discount || 0),
    tax: Number(pricing?.tax || 0),
    deliveryFee: Number(pricing?.deliveryFee || 0),
    youAreSaving: Number(pricing?.youAreSaving || 0),
    totalAmount: Number(pricing?.totalAmount || data?.totalAmount || 0),
  };
};

// Keep the existing UI behavior: `state.cart.items.length` equals total quantity.
const expandItemsByQuantity = (apiItems) => {
  if (!Array.isArray(apiItems)) return [];
  const expanded = [];

  for (const rawItem of apiItems) {
    const quantity = Number(
      rawItem?.CartItem?.quantity ?? rawItem?.quantity ?? rawItem?.qty ?? 1
    ) || 1;
    const packSize = Number(
      rawItem?.CartItem?.packSize ??
        rawItem?.packSize ??
        rawItem?.pack_size ??
        rawItem?.pack?.quantity ??
        1
    ) || 1;
    const resolvedPrice =
      rawItem?.CartItem?.price ?? rawItem?.price ?? rawItem?.product?.price;
    const product = rawItem?.product ?? rawItem?.item ?? rawItem;
    const normalized = normalizeProduct({
      ...product,
      id:
        getProductId(product) ??
        rawItem?.productId ??
        rawItem?.product_id ??
        rawItem?.product?._id ??
        rawItem?._id ??
        null,
      name: product?.name ?? rawItem?.name,
      price: resolvedPrice,
      packSize,
      packQuantity: packSize,
      images: product?.images ?? rawItem?.images,
      image: product?.image ?? rawItem?.image,
    });

    for (let i = 0; i < quantity; i += 1) {
      expanded.push(normalized);
    }
  }

  return expanded.filter((item) => item?.id);
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await getCart();
  const pricing = extractCartPricing(res);
  return {
    items: expandItemsByQuantity(extractCartItems(res)),
    pricing,
    totalAmount: Number(pricing?.totalAmount || 0),
  };
});

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async ({ product, quantity = 1 }) => {
    const normalized = normalizeProduct(product);
    const productId = getProductId(normalized);
    const packSize = Math.max(1, Number(getPackSize(normalized) || 1));
    if (!productId) throw new Error("Missing product id");
    await addCartItem({ productId, packSize, quantity });
    return { product: normalized, quantity };
  }
);

export const setCartItemQuantityAsync = createAsyncThunk(
  "cart/setCartItemQuantity",
  async ({ product, productId, packId, packSize, quantity }) => {
    const normalized = normalizeProduct(product);
    const resolvedProductId =
      productId ?? getProductId(normalized);
    const resolvedPackSize = Math.max(1, Number(packSize || getPackSize(normalized) || 1));
    const resolvedQuantity = Math.max(1, Number(quantity || 1));

    if (!resolvedProductId) throw new Error("Missing product id");

    await updateCartItemQuantity({
      productId: resolvedProductId,
      packSize: resolvedPackSize,
      quantity: resolvedQuantity,
    });

    return {
      product: normalized,
      productId: resolvedProductId,
      packId,
      packSize: resolvedPackSize,
      quantity: resolvedQuantity,
    };
  }
);

export const clearCartAsync = createAsyncThunk("cart/clearCart", async () => {
  await clearCart();
  return true;
});

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (payload) => {
    const productId =
      typeof payload === "object" ? payload?.productId : payload;
    if (!productId) throw new Error("Missing product id");
    await removeCartItem({ productId });
    return payload;
  }
);

export const removeSingleFromCartAsync = createAsyncThunk(
  "cart/removeSingleFromCart",
  async (payload, { getState }) => {
    const productId =
      typeof payload === "object" ? payload?.productId : payload;
    const packId =
      typeof payload === "object" ? payload?.packId : undefined;
    const packSize =
      typeof payload === "object" ? payload?.packSize : undefined;
    if (!productId) throw new Error("Missing product id");

    // Try to derive current quantity from expanded state.
    const state = getState?.() || {};
    const items = state?.cart?.items || [];
    const currentQty = items.filter((i) => isSameCartVariant(i, productId, packId)).length;

    if (currentQty <= 1) {
      await removeCartItem({ productId });
      return payload;
    }

    // Prefer decrement semantics first (most likely to match an "add item" API).
    try {
      await decrementCartItem({ productId, packSize });
      return payload;
    } catch {}

    // Fallback: absolute quantity update (PATCH/PUT).
    await updateCartItemQuantity({ productId, quantity: currentQty - 1 });
    return payload;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    pricing: {
      mrp: 0,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      youAreSaving: 0,
      totalAmount: 0,
    },
    totalAmount: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      state.items.push(action.payload);
    },
    removeSingleFromCart: (state, action) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload
      );
      if (index !== -1) {
        state.items.splice(index, 1);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        item => item.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.items || [];
        state.pricing = action.payload?.pricing || state.pricing;
        state.totalAmount = Number(action.payload?.totalAmount || 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Failed to load cart";
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const { product, quantity } = action.payload || {};
        const normalized = normalizeProduct(product);
        const qty = Number(quantity || 1) || 1;
        for (let i = 0; i < qty; i += 1) {
          if (normalized?.id) state.items.push(normalized);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.error = action.error?.message || "Failed to add to cart";
      })
      .addCase(setCartItemQuantityAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(setCartItemQuantityAsync.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const product = normalizeProduct(payload.product);
        const productId = payload.productId;
        const packId = payload.packId;
        const quantity = Math.max(1, Number(payload.quantity || 1));

        const remaining = state.items.filter(
          (item) => !isSameCartVariant(item, productId, packId)
        );

        const rebuilt = [];
        for (let i = 0; i < quantity; i += 1) {
          rebuilt.push({
            ...product,
            id: productId,
            packId,
          });
        }

        state.items = [...remaining, ...rebuilt];
      })
      .addCase(setCartItemQuantityAsync.rejected, (state, action) => {
        state.error = action.error?.message || "Failed to update quantity";
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.pricing = {
          mrp: 0,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          youAreSaving: 0,
          totalAmount: 0,
        };
        state.totalAmount = 0;
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        const payload = action.payload;
        const productId = typeof payload === "object" ? payload?.productId : payload;
        const packId = typeof payload === "object" ? payload?.packId : undefined;
        state.items = state.items.filter(
          (item) => !isSameCartVariant(item, productId, packId)
        );
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.error = action.error?.message || "Failed to remove item";
      })
      .addCase(removeSingleFromCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(removeSingleFromCartAsync.fulfilled, (state, action) => {
        const payload = action.payload;
        const productId = typeof payload === "object" ? payload?.productId : payload;
        const packId = typeof payload === "object" ? payload?.packId : undefined;
        const index = state.items.findIndex((item) =>
          isSameCartVariant(item, productId, packId)
        );
        if (index !== -1) state.items.splice(index, 1);
      })
      .addCase(removeSingleFromCartAsync.rejected, (state, action) => {
        state.error = action.error?.message || "Failed to update quantity";
      });
  },
});

export const { addToCart, removeSingleFromCart, removeFromCart } =
  cartSlice.actions;
export default cartSlice.reducer;
