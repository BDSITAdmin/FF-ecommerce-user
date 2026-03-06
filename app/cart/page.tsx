"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Shield, Truck, Leaf } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, removeSingleFromCart } from "../../store/cartSlice";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import Navbar from "../../components/Navbar";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  images?: string[];
  image?: string;
};

type RootState = {
  cart: {
    items: CartItem[];
  };
};

export default function CartPage() {
  useRequireAuth();

  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

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
  const discount = subtotal > 0 ? Math.round(subtotal * 0.2) : 0;
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true);
      // Add your promo logic here
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f7f0] to-[#e8f3e8]">
      <Navbar />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
        {/* Breadcrumb */}
        <div className="text-sm mb-6">
          <span className="text-black/60">Home</span>
          <span className="mx-2 text-black/40">{">"}</span>
          <span className="text-green-800 font-medium">Cart</span>
        </div>

        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-light tracking-wide text-black">
            YOUR <span className="font-semibold text-black">CART</span>
          </h3>
        </div>

        {groupedItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-3xl p-16 text-center shadow-xl">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-3xl font-semibold text-black mb-3">Your cart is empty</h2>
            <p className="text-black/70 mb-8">Looks like you haven't added anything yet</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all shadow-lg shadow-green-600/30"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
            {/* Cart Items Section */}
            <section className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black">
                  Cart Items ({groupedItems.length})
                </h2>
                <span className="text-black text-sm font-medium">Free shipping on orders over $100</span>
              </div>

              <div className="space-y-4">
                {groupedItems.map((item, index) => {
                  const itemImage = item.images?.[0] || item.image || "/assate/home-image.webp";
                  return (
                    <div
                      key={item.id}
                      className="group grid grid-cols-[100px_1fr_auto] gap-6 items-center p-4 rounded-2xl hover:bg-green-50/50 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Product Image */}
                      <div className="w-[100px] h-[100px] rounded-xl bg-gradient-to-br from-green-100 to-green-50 overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Details */}
                      <div>
                        <h3 className="text-2xl font-semibold text-black group-hover:text-black transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-black text-sm mt-1 flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-3xl font-bold text-black mt-2">
                          ${Number(item.price).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-4">
                        <button
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 rounded-full bg-green-50 px-2 py-1 border border-green-100">
                          <button
                            onClick={() => dispatch(removeSingleFromCart(item.id))}
                            className="w-8 h-8 rounded-full bg-white text-black hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-black min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(addToCart(item))}
                            className="w-8 h-8 rounded-full bg-white text-black hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Eco-friendly Message */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl flex items-center gap-3 border border-green-200">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-black" />
                </div>
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Eco-friendly choice!</span> Your cart items are carbon neutral.
                </p>
              </div>
            </section>

            {/* Order Summary Section */}
            <aside className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-3xl p-6 h-fit shadow-xl sticky top-24">
              <h2 className="text-3xl font-semibold text-black mb-6 flex items-center gap-2">
                Order Summary
                <span className="text-sm font-normal text-black bg-green-50 px-3 py-1 rounded-full">
                  {groupedItems.length} items
                </span>
              </h2>

              <div className="space-y-4 border-b border-green-100 pb-6">
                <div className="flex justify-between items-center">
                  <span className="text-black">Subtotal</span>
                  <span className="font-semibold text-black text-lg">${subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black flex items-center gap-1">
                    Discount (20% OFF)
                    <Tag className="w-4 h-4 text-green-500" />
                  </span>
                  <span className="font-semibold text-black">-${discount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black flex items-center gap-1">
                    Delivery Fee
                    <Truck className="w-4 h-4 text-green-500" />
                  </span>
                  <span className="font-semibold text-black">${deliveryFee}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 mb-6">
                <span className="text-xl text-black font-medium">Total</span>
                <span className="text-4xl font-bold text-black">${total}</span>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-green-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Add promo code"
                      className="w-full h-12 rounded-full bg-green-50 border border-green-200 pl-10 pr-4 text-sm text-black placeholder-green-400 outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="h-12 px-6 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-black animate-fadeIn">✓ Promo code applied successfully!</p>
                )}
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full h-14 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-medium flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-600 transition-all shadow-lg shadow-green-600/30 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-black">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
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