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

const normalizeProduct = (product) => {
  if (!product) return null;
  const id = getProductId(product);
  return {
    ...product,
    id,
  };
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

// Keep the existing UI behavior: `state.cart.items.length` equals total quantity.
const expandItemsByQuantity = (apiItems) => {
  if (!Array.isArray(apiItems)) return [];
  const expanded = [];

  for (const rawItem of apiItems) {
    const quantity = Number(rawItem?.quantity ?? rawItem?.qty ?? 1) || 1;
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
      price: product?.price ?? rawItem?.price,
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
  return expandItemsByQuantity(extractCartItems(res));
});

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async ({ product, quantity = 1 }) => {
    const normalized = normalizeProduct(product);
    const productId = getProductId(normalized);
    if (!productId) throw new Error("Missing product id");
    await addCartItem({ productId, quantity });
    return { product: normalized, quantity };
  }
);

export const clearCartAsync = createAsyncThunk("cart/clearCart", async () => {
  await clearCart();
  return true;
});

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (productId) => {
    if (!productId) throw new Error("Missing product id");
    await removeCartItem({ productId });
    return productId;
  }
);

export const removeSingleFromCartAsync = createAsyncThunk(
  "cart/removeSingleFromCart",
  async (productId, { getState }) => {
    if (!productId) throw new Error("Missing product id");

    // Try to derive current quantity from expanded state.
    const state = getState?.() || {};
    const items = state?.cart?.items || [];
    const currentQty = items.filter((i) => i?.id === productId).length;

    if (currentQty <= 1) {
      await removeCartItem({ productId });
      return productId;
    }

    // Prefer decrement semantics first (most likely to match an "add item" API).
    try {
      await decrementCartItem({ productId });
      return productId;
    } catch {}

    // Fallback: absolute quantity update (PATCH/PUT).
    await updateCartItemQuantity({ productId, quantity: currentQty - 1 });
    return productId;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
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
        state.items = action.payload;
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
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.error = action.error?.message || "Failed to remove item";
      })
      .addCase(removeSingleFromCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(removeSingleFromCartAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload);
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
