"use client";

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Truck, UserRoundPen } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Navbar from '@/components/Navbar';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import api from '@/services/api';

type CartItem = {
  id: string | number;
  price: number;
  packId?: string;
  packSize?: number;
  packQuantity?: number;
};

export default function CheckoutPage() {
  const { form, isSubmitting, submitError, submitSuccess, formErrors, submitOrder } = useCheckoutForm();
  const cartItems = useSelector((state: any) => state.cart.items as CartItem[]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, CartItem & { quantity: number }>();

    for (const item of cartItems) {
      const cartKey = `${item.id}::${item.packId || 'default'}`;
      const existing = map.get(cartKey);
      if (existing) {
        existing.quantity += 1;
      } else {
        map.set(cartKey, { ...item, quantity: 1 });
      }
    }

    return Array.from(map.values());
  }, [cartItems]);

  const [invoiceBreakdown, setInvoiceBreakdown] = useState({
    mrp: 0,
    discount: 0,
    totalSavings: 0,
    shipping: 0,
    tax: 0,
    totalToPay: 0,
  });

  const fallbackSubtotal = groupedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  useEffect(() => {
    if (!groupedItems.length) {
      setInvoiceBreakdown({
        mrp: 0,
        discount: 0,
        totalSavings: 0,
        shipping: 0,
        tax: 0,
        totalToPay: 0,
      });
      return;
    }

    let cancelled = false;

    const loadInvoiceBreakdown = async () => {
      const totals = await Promise.all(
        groupedItems.map(async (item) => {
          const packQuantity = Math.max(1, Number(item.packQuantity || item.packSize || 1));
          const qty = Math.max(1, Number(item.quantity || 1));

          try {
            const res = await api.get(`/api/v1/products/${item.id}/packs`, {
              params: { quantity: packQuantity },
            });

            const pack = res?.data?.data?.packs?.[0];
            const totalToPay = Number(pack?.pricing?.totalToPay);
            const mrp = Number(pack?.pricing?.mrp || 0);
            const discount = Number(pack?.pricing?.discount || 0);
            const totalSavings = Number(pack?.pricing?.totalSavings || 0);
            const shipping = Number(pack?.pricing?.shipping || 0);
            const tax = Number(pack?.pricing?.tax || 0);

            if (Number.isFinite(totalToPay) && totalToPay > 0) {
              return {
                mrp: mrp * qty,
                discount: discount * qty,
                totalSavings: totalSavings * qty,
                shipping: shipping * qty,
                tax: tax * qty,
                totalToPay: totalToPay * qty,
              };
            }
          } catch {
            // Fallback to cart line pricing when pack pricing API is unavailable.
          }

          const fallbackTotal = Number(item.price || 0) * qty;
          return {
            mrp: fallbackTotal,
            discount: 0,
            totalSavings: 0,
            shipping: 0,
            tax: 0,
            totalToPay: fallbackTotal,
          };
        })
      );

      if (cancelled) return;

      const computedBreakdown = totals.reduce(
        (acc, row) => ({
          mrp: acc.mrp + Number(row?.mrp || 0),
          discount: acc.discount + Number(row?.discount || 0),
          totalSavings: acc.totalSavings + Number(row?.totalSavings || 0),
          shipping: acc.shipping + Number(row?.shipping || 0),
          tax: acc.tax + Number(row?.tax || 0),
          totalToPay: acc.totalToPay + Number(row?.totalToPay || 0),
        }),
        { mrp: 0, discount: 0, totalSavings: 0, shipping: 0, tax: 0, totalToPay: 0 }
      );

      setInvoiceBreakdown(computedBreakdown);
    };

    loadInvoiceBreakdown();

    return () => {
      cancelled = true;
    };
  }, [groupedItems]);

  const subtotal = invoiceBreakdown.totalToPay || fallbackSubtotal;
  const formatAmount = (value: number) => Math.round(value).toLocaleString("en-IN");

  return (
    <main className="min-h-screen bg-white  text-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[#0065A6] hover:text-black mb-8">
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

          <aside className="bg-white/90 py-4 px-10 h-fit lg:sticky lg:top-8 border border-[#6F6F6F]/30 rounded-2xl">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#6F6F6F]">
              <h2 className="text-2xl font-semibold text-black">Invoice Summary</h2>
              <span className="text-sm font-medium text-[#0065A6] bg-[#0065A6]/10 px-3 py-1 rounded-full">
                {groupedItems.length} items
              </span>
            </div>

            <div className="space-y-5 pb-6 border-b border-[#6F6F6F]">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total MRP</span>
                <span className="font-semibold text-black text-lg">Rs. {formatAmount(invoiceBreakdown.mrp || subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Discount</span>
                <span className="font-semibold text-[#0065A6]">- Rs. {formatAmount(invoiceBreakdown.discount || 0)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Tax
                   {/* <span className="text-[#0065A6]">(Free)</span> */}
                </span>
                <span className="text-right">
                  <span className="font-semibold text-[#0065A6]">Free</span>
                  <span className="ml-2 text-sm text-gray-500">Rs. {formatAmount(invoiceBreakdown.tax || 0)}</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center gap-2">
                  Delivery Fee
                  {/* <span className="text-[#0065A6]">(Free)</span> */}
                  <Truck className="w-4 h-4 text-[#0065A6]" />
                </span>
                <span className="text-right">
                  <span className="font-semibold text-[#0065A6]">Free</span>
                  <span className="ml-2 text-sm text-gray-500">Rs. {formatAmount(invoiceBreakdown.shipping || 0)}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">You are saving</span>
                <span className="text-xl font-extrabold text-green-700">
                  Rs. {formatAmount(invoiceBreakdown.totalSavings || invoiceBreakdown.discount || 0)}
                </span>
              </div>
              <p className="mt-1 text-xs text-green-700/90">Great deal. Your discount and offers are already applied.</p>
            </div>

            <div className="flex justify-between items-center py-6">
              <span className="text-xl font-semibold text-black">Total</span>
              <span className="text-2xl font-bold text-black">Rs. {formatAmount(subtotal)}</span>
            </div>

            <button
              onClick={submitOrder}
              disabled={isSubmitting || !form.formState.isValid}
              className="w-full h-14 rounded-full bg-[#0065A6] text-white font-medium flex items-center justify-center transition-all shadow-lg shadow-[#0065A6]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
