"use client";

import { useSelector } from "react-redux";
import api from "../../services/api";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
};

type RootState = {
  cart: {
    items: CartItem[];
  };
};

export default function Checkout() {
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const placeOrder = async () => {
    await api.post("/orders", { items: cartItems });
    alert("Order placed successfully!");
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <button
        onClick={placeOrder}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Confirm Order
      </button>
    </div>
  );
}
