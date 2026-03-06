"use client";

import { useSelector } from "react-redux";
import { useRequireAuth } from "../../hooks/useRequireAuth";

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

export default function CartPage() {
  useRequireAuth();

  const cartItems = useSelector((state: RootState) => state.cart.items);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.map((item) => (
        <div key={item.id} className="border p-4 mb-3">
          <h3>{item.name}</h3>
          <p>Rs. {item.price}</p>
        </div>
      ))}
    </div>
  );
}
