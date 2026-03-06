import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
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
});

export const { addToCart, removeSingleFromCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
