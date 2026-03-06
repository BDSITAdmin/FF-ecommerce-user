"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ChevronRight, Lock, ShieldCheck, Truck } from 'lucide-react';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import PaymentMethod from '@/components/PaymentMethod';

type StoreCartItem = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
};

type CheckoutCartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type RootState = {
  cart: {
    items: StoreCartItem[];
  };
};

function CartSummary({ items }: { items: CheckoutCartItem[] }) {
  const inr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 49;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-emerald-50/50 p-3">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-emerald-100 shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs font-semibold text-emerald-700">
                    Item
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {inr.format(item.price * item.quantity)}
              </p>
            </div>
          ))}
          <div className="border-t border-emerald-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{inr.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : inr.format(shipping)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>GST (18%)</span>
              <span>{inr.format(tax)}</span>
            </div>
            <div className="mt-2 border-t border-emerald-100 pt-3 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">{inr.format(total)}</span>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/cart"
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        Edit cart
        <ChevronRight className="h-4 w-4" />
      </Link>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure checkout with encrypted payment data
        </div>
      </div>
    </div>
  );
}

const CheckoutPage = () => {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useCheckoutForm();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const groupedCartItems = useMemo<CheckoutCartItem[]>(() => {
    const map = new Map<string | number, CheckoutCartItem>();

    for (const item of cartItems) {
      const existing = map.get(item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        map.set(item.id, {
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: 1,
          image: item.images?.[0] || item.image || '',
        });
      }
    }

    return Array.from(map.values());
  }, [cartItems]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f7fffa] via-[#eefcf4] to-[#f6f7ff]">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Final Step
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-slate-900">
            Checkout
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-slate-700">
              1. Shipping
            </span>
            <span className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-slate-700">
              2. Payment
            </span>
            <span className="rounded-full border border-emerald-500 bg-emerald-500 px-4 py-2 font-semibold text-white">
              3. Review & Place Order
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-5">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.email
                        ? 'border-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.firstName
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-rose-600">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.lastName
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-rose-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.phone
                        ? 'border-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-rose-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-5">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.address
                        ? 'border-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      placeholder="123 Main St"
                    />
                    {errors.address && <p className="mt-1 text-sm text-rose-600">{errors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="apartment" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.city
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                      />
                      {errors.city && <p className="mt-1 text-sm text-rose-600">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        State / Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.state
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                      />
                      {errors.state && <p className="mt-1 text-sm text-rose-600">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.zipCode
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                      />
                      {errors.zipCode && <p className="mt-1 text-sm text-rose-600">{errors.zipCode}</p>}
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.country
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                      >
                        <option value="IN">India</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="SG">Singapore</option>
                        <option value="US">United States</option>
                      </select>
                      {errors.country && <p className="mt-1 text-sm text-rose-600">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <PaymentMethod formData={formData} errors={errors} onChange={handleChange} />

              <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 p-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">
                    Save this information for next time
                  </span>
                </label>
              </div>

              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </section>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-5">
              <CartSummary items={groupedCartItems} />

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {isSubmitting ? 'Processing...' : 'Place Secure Order'}
              </button>

              <div className="rounded-3xl border border-emerald-100 bg-white/90 p-4 text-sm text-slate-600 shadow-lg shadow-emerald-900/5">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  Free shipping on orders over Rs. 1,000
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  You can return your items within 30 days after delivery.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

