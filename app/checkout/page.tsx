"use client";

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, Truck, UserRoundPen } from 'lucide-react';
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
  const { form, isSubmitting, submitError, submitSuccess, formErrors, submitOrder, currentStep, nextStep, prevStep, shippingAddress, isValid } = useCheckoutForm();
  const selectedPaymentMethod = form.watch("paymentMethod");
  const stepOrder = ["address", "shipping", "payment", "review"] as const;
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
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const getPrimaryButtonLabel = () => {
    if (isSubmitting) return "Processing...";
    if (currentStep === "payment") return "Review Order";
    if (currentStep === "review") {
      return selectedPaymentMethod === "COD" ? "Place COD Order" : "Pay Online";
    }
    return "Continue";
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[#0065A6] hover:text-black mb-8">
          <ArrowLeft size={20} />
          Back to Cart
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.2em] text-black/60">Secure Checkout</p>
              <h1 className="mt-2 text-3xl font-bold text-black">Checkout</h1>
            </div>

            <div className="mb-8 grid gap-3 sm:grid-cols-4">
              {stepOrder.map((step, index) => {
                const isActive = step === currentStep;
                const isDone = index < currentStepIndex;
                let stepClass = "border-black/10 bg-white text-black/45";
                if (isActive) stepClass = "border-[#0065A6] bg-[#0065A6] text-white";
                else if (isDone) stepClass = "border-[#0065A6]/20 bg-[#0065A6]/5 text-[#0065A6]";
                return (
                  <div
                    key={step}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize ${stepClass}`}
                  >
                    {index + 1}. {step}
                  </div>
                );
              })}
            </div>

            {currentStep === "address" && (
              <section className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <UserRoundPen size={18} className="text-[#0065A6]" />
                  <h2 className="text-lg font-semibold text-black">Contact Details</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="First Name" error={formErrors.firstName?.message}>
                    <input {...form.register("firstName")} autoComplete="off" className="input-field" />
                  </Field>
                  <Field label="Last Name" error={formErrors.lastName?.message}>
                    <input {...form.register("lastName")} autoComplete="off" className="input-field" />
                  </Field>
                  <Field label="Email" error={formErrors.email?.message}>
                    <input {...form.register("email")} type="email" autoComplete="off" className="input-field" />
                  </Field>
                  <Field label="Phone" error={formErrors.phone?.message}>
                    <input {...form.register("phone")} autoComplete="off" className="input-field" />
                  </Field>
                </div>
              </section>
            )}

            {currentStep === "shipping" && (
              <section className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-[#0065A6]" />
                  <h2 className="text-lg font-semibold text-black">Shipping Address</h2>
                </div>
                <div className="space-y-4">
                  <Field label="Address" error={formErrors.address?.message}>
                    <input {...form.register("address")} autoComplete="off" className="input-field" />
                  </Field>
                  <Field label="Apartment / Suite (optional)">
                    <input {...form.register("apartment")} autoComplete="off" className="input-field" />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="City" error={formErrors.city?.message}>
                      <input {...form.register("city")} autoComplete="off" className="input-field" />
                    </Field>
                    <Field label="State" error={formErrors.state?.message}>
                      <input {...form.register("state")} autoComplete="off" className="input-field" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="ZIP Code" error={formErrors.zipCode?.message}>
                      <input {...form.register("zipCode")} autoComplete="off" className="input-field" />
                    </Field>
                    <Field label="Country" error={formErrors.country?.message}>
                      <select {...form.register("country")} className="input-field">
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="AE">UAE</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </section>
            )}

            {currentStep === "payment" && (
              <section className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#0065A6]" />
                  <h2 className="text-lg font-semibold text-black">Select Payment</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <PaymentOptionCard
                    checked={selectedPaymentMethod === "COD"}
                    title="COD"
                    description="Create order immediately and pay on delivery."
                    onSelect={() => form.setValue("paymentMethod", "COD", { shouldValidate: true })}
                  />
                  <PaymentOptionCard
                    checked={selectedPaymentMethod === "RAZORPAY"}
                    title="ONLINE"
                    description="Create Razorpay order, open payment popup, verify payment, then create order."
                    onSelect={() => form.setValue("paymentMethod", "RAZORPAY", { shouldValidate: true })}
                  />
                </div>

                <label className="mt-5 flex items-center gap-3 rounded-2xl border border-black/10 bg-gray-50 p-4 text-sm text-black/75">
                  <input type="checkbox" {...form.register("saveInfo")} className="h-4 w-4 accent-[#0065A6]" />
                  <span>Save this information for next time</span>
                </label>
              </section>
            )}

            {currentStep === "review" && (
              <section className="mb-10 space-y-6">
                <div className="rounded-3xl border border-black/10 bg-gray-50 p-6">
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                  <p className="mt-3 text-sm text-black/70">{shippingAddress.name}</p>
                  <p className="text-sm text-black/70">{shippingAddress.street}</p>
                  <p className="text-sm text-black/70">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-black/70">{shippingAddress.country}</p>
                  <p className="text-sm text-black/70">{shippingAddress.phone}</p>
                </div>

                <div className="rounded-3xl border border-black/10 bg-gray-50 p-6">
                  <h2 className="text-lg font-semibold">Payment Flow</h2>
                  {selectedPaymentMethod === "COD" ? (
                    <div className="mt-3 space-y-2 text-sm text-black/70">
                      <p>1. Create Order</p>
                      <p>2. Redirect to Success Page</p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 text-sm text-black/70">
                      <p>1. Create Razorpay Order</p>
                      <p>2. Open Payment Popup</p>
                      <p>3. Verify Payment</p>
                      <p>4. Create Order</p>
                      <p>5. Redirect to Success Page</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {submitError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{submitError}</div>}
            {submitSuccess && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{submitSuccess}</div>}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-black hover:border-black/30 disabled:opacity-50"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting || !isValid}
                className="rounded-2xl bg-[#0065A6] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {getPrimaryButtonLabel()}
              </button>
            </div>
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

function Field({
  label,
  error,
  children,
}: Readonly<{
  label: string;
  error?: string;
  children: React.ReactNode;
}>) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-[#0065A6]">{error}</p>}
    </div>
  );
}

function PaymentOptionCard({
  checked,
  title,
  description,
  onSelect,
}: Readonly<{
  checked: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-3xl border p-5 text-left transition ${checked
        ? "border-[#0065A6] bg-[#0065A6] text-white"
        : "border-black/10 bg-white text-black hover:border-[#0065A6]/40"
        }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span
          className={`h-4 w-4 rounded-full border ${checked ? "border-white bg-white" : "border-black/20 bg-transparent"
            }`}
        />
      </div>
      <p className={`mt-3 text-sm ${checked ? "text-white/85" : "text-black/65"}`}>{description}</p>
    </button>
  );
}
