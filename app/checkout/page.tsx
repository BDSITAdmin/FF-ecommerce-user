"use client";

import { ArrowLeft, MapPin, UserRoundPen } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Navbar from '@/components/Navbar';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';

export default function CheckoutPage() {
  const { form, isSubmitting, submitError, submitSuccess, formErrors, submitOrder } = useCheckoutForm();
  const cartItems = useSelector((state: any) => state.cart.items);
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
  const formatAmount = (value: number) => Math.round(value).toLocaleString("en-IN");

  return (
    <main className="min-h-screen bg-white  text-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/cart" className="flex items-center gap-2 mt-8 text-[#0065A6] hover:text-black mb-8 inline-flex">
          <ArrowLeft size={20} />
          Back to Cart
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="bg-white shadow-2xl rounded-3xl p-8 border border-black/10">
            <div className="mb-8">
              <p className="text-sm tracking-[0.2em] uppercase text-black/60">Secure Checkout</p>
              <h1 className="text-3xl font-bold text-black mt-2">Checkout</h1>
            </div>

            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <UserRoundPen size={18} className="text-[#0065A6]" />
                <h2 className="text-lg font-semibold text-black">Contact Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    {...form.register('firstName')}
                    autoComplete="off"
                    className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                  />
                  {formErrors.firstName && <p className="text-[#0065A6] text-sm mt-1">{formErrors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    {...form.register('lastName')}
                    autoComplete="off"
                    className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                  />
                  {formErrors.lastName && <p className="text-[#0065A6] text-sm mt-1">{formErrors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    {...form.register('email')}
                    type="email"
                    autoComplete="off"
                    className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                  />
                  {formErrors.email && <p className="text-[#0065A6] text-sm mt-1">{formErrors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    {...form.register('phone')}
                    autoComplete="off"
                    className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                  />
                  {formErrors.phone && <p className="text-[#0065A6] text-sm mt-1">{formErrors.phone.message}</p>}
                </div>
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[#0065A6]" />
                <h2 className="text-lg font-semibold text-black">Shipping Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    {...form.register('address')}
                    autoComplete="off"
                    className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                  />
                  {formErrors.address && <p className="text-[#0065A6] text-sm mt-1">{formErrors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apartment / Suite (optional)</label>
                  <input
                    {...form.register('apartment')}
                    autoComplete="off"
                    className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      {...form.register('city')}
                      autoComplete="off"
                      className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                    />
                    {formErrors.city && <p className="text-[#0065A6] text-sm mt-1">{formErrors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      {...form.register('state')}
                      autoComplete="off"
                      className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                    />
                    {formErrors.state && <p className="text-[#0065A6] text-sm mt-1">{formErrors.state.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      {...form.register('zipCode')}
                      autoComplete="off"
                      className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                    />
                    {formErrors.zipCode && <p className="text-[#0065A6] text-sm mt-1">{formErrors.zipCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <select
                      {...form.register('country')}
                      autoComplete="off"
                      className="w-full p-3 border border-black/15 rounded-lg bg-white text-black focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30 outline-none"
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="AE">UAE</option>
                    </select>
                    {formErrors.country && <p className="text-[#0065A6] text-sm mt-1">{formErrors.country.message}</p>}
                  </div>
                </div>
              </div>
            </section>

            <input type="hidden" {...form.register('paymentMethod')} />
            <input type="hidden" {...form.register('saveInfo')} />
          </div>

          <aside className="bg-white shadow-2xl rounded-3xl p-6 border border-black/10 h-fit lg:sticky lg:top-8">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-black/70">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-black/10 pt-3 mt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{formatAmount(subtotal)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={submitOrder}
              disabled={isSubmitting || !form.formState.isValid}
              className="mt-6 w-full px-6 py-4 bg-[#0065A6] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>

            {submitError && <div className="mt-4 p-4 bg-white border border-[#0065A6] text-[#0065A6] rounded-lg">{submitError}</div>}
            {submitSuccess && <div className="mt-4 p-4 bg-white border border-[#0065A6] text-[#0065A6] rounded-lg">{submitSuccess}</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
