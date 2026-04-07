"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Leaf, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCartAsync,
  clearCartAsync,
  fetchCart,
  removeFromCartAsync,
  removeSingleFromCartAsync,
} from "../../store/cartSlice";
import Navbar from "../../components/Navbar";
import { store } from "../../store/store";
import ixanLogo from "../../public/assate/ixan-logo.svg";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  image?: string;
};

type RootState = {
  cart: {
    items: CartItem[];
  };
  user: {
    user: unknown;
  };
};

export default function CartPage() {
  const router = useRouter();
  type AppDispatch = typeof store.dispatch;
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const handleAddToCart = (item: CartItem) => {
    if (!user) {
      router.push("/login");
      return;
    }
    dispatch(addToCartAsync({ product: item, quantity: 1 }));
  };

  const groupedItems = useMemo(() => {
    const map = new Map<string | number, CartItem & { quantity: number }>();
    for (const item of cartItems) {
      const existing = map.get(item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        map.set(item.id, { ...item, quantity: 1 });
      }
    }
    return Array.from(map.values());
  }, [cartItems]);

  const subtotal = groupedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );
  const formatAmount = (value: number) => Math.round(value).toLocaleString("en-IN");




  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Decorative Elements
      <div className="absolute top-20 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl -z-10"></div> */}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8">

        {groupedItems.length === 0 ? (
          /* ================= EMPTY CART ================= */
          <div className="border border-[#0065A6] rounded-3xl p-10 sm:p-16 text-center shadow-xl">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0065A6] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-black mb-3">
              Your cart is empty
            </h2>

            <p className="text-black/70 mb-6 sm:mb-8">
              Looks like you haven&apos;t added anything yet
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#0065A6] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium shadow-lg"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
            {/* Cart Items Section */}
            <section>
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                <h2 className="text-xl sm:text-2xl font-semibold text-black flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
                  Cart Items ({groupedItems.length})
                </h2>

                <button
                  type="button"
                  onClick={() => dispatch(clearCartAsync())}
                  className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#0065A4] text-[#0065A4] font-medium hover:bg-[#0065A4] hover:text-white transition"
                >
                  Clear cart
                </button>
              </div>

              {/* ITEMS */}
              <div className="space-y-4 bg-white border border-[#0065A4] rounded-xl p-4 sm:p-6">

                {groupedItems.map((item, index) => {
                  const itemImage =
                    item.images?.[0] || item.image || "/assate/home-image.webp";

                  return (
                    <div
                      key={item.id}
                      className="group grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-4 sm:gap-6 items-start sm:items-center"
                    >
                      {/* IMAGE */}
                      <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]  bg-gradient-to-br from-[#0065A6]/10 to-[#0065A6]/30 overflow-hidden shadow-md">
                        <img
                          src={itemImage}
                          alt={item.name}
                          width={140}
                          height={140}

                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="flex flex-col gap-1 sm:pl-4">
                        <Image
                          src={ixanLogo}
                          alt="Ixan Logo"
                          width={231}
                          height={64}
                          className="w-full max-w-[140px] sm:max-w-[74px] md:max-w-[74px] h-auto"
                        />

                        <p className="text-black text-sm sm:text-[16px] mt-1 sm:mr-40">
                          Pack Size: 60 Veg Capsules (2-Month Pack)
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 w-full sm:w-auto">

                        {/* REMOVE */}
                        <button
                          onClick={() => dispatch(removeFromCartAsync(item.id))}
                          className="text-black hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* PRICE */}
                        <p className="text-xl   text-black font-semibold sm:text-[28px] leading-[36px] tracking-normal">
                          Rs. {formatAmount(Number(item.price))} /-
                        </p>

                        {/* QUANTITY */}
                        <div className="flex items-center gap-3 px-3 py-2 border border-[#C5C5C5] rounded-md">
                          <button
                            onClick={() => dispatch(removeSingleFromCartAsync(item.id))}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-sm font-semibold text-black min-w-6 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Order Summary Section */}
            <aside className="bg-white py-4 px-4 sm:px-6 lg:px-10 h-fit lg:sticky lg:top-6 rounded-xl ">

              {/* Header */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#6F6F6F]">
                <h2 className="text-2xl font-semibold text-black flex items-center gap-2">
                  Invoice Summary
                </h2>

                <span className="text-sm font-medium text-[#0065A6] bg-[#0065A6]/10 px-3 py-1 rounded-full">
                  {groupedItems.length} items
                </span>
              </div>

              {/* Price Details */}
              <div className="space-y-5 pb-6 border-b border-[#6F6F6F]">

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-black text-lg">
                    Rs. {formatAmount(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex items-center gap-2">
                    Delivery Fee
                    <Truck className="w-4 h-4 text-[#0065A6]" />
                  </span>

                  <span className="font-semibold text-[#0065A6]">
                    Free
                  </span>
                </div>

              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-6">

                <span className="text-xl font-semibold text-black">
                  Total
                </span>

                <span className="text-2xl font-bold text-black">
                  Rs. {formatAmount(subtotal)}
                </span>

              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full h-14 rounded-full bg-[#0065A6] text-white font-medium flex items-center justify-center gap-2  transition-all shadow-lg shadow-[#0065A6]/30"
              >
                Order Now
                <ArrowRight className="w-4 h-4" />
              </Link>

            </aside>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .group {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}

