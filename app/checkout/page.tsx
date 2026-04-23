"use client";

import { ArrowLeft, CreditCard, MapPin, ShieldCheck, UserRoundPen } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";

const stepOrder = ["address", "shipping", "payment", "review"] as const;

export default function CheckoutPage() {
  const {
    form,
    currentStep,
    nextStep,
    prevStep,
    isSubmitting,
    submitError,
    submitSuccess,
    formErrors,
    shippingAddress,
    isValid,
  } = useCheckoutForm();
  const cartItems = useSelector((state: any) => state.cart.items);
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const selectedPaymentMethod = form.watch("paymentMethod");
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
      <div className="max-w-7xl mx-auto px-6 pb-10 sm:px-6 lg:px-12">
        <Link href="/cart" className="mt-8 mb-8 inline-flex items-center gap-2 text-[#0065A6] hover:text-black">
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
                return (
                  <div
                    key={step}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize ${
                      isActive
                        ? "border-[#0065A6] bg-[#0065A6] text-white"
                        : isDone
                          ? "border-[#0065A6]/20 bg-[#0065A6]/5 text-[#0065A6]"
                          : "border-black/10 bg-white text-black/45"
                    }`}
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
                  Save this information for next time
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

          <aside className="h-fit self-start rounded-3xl border border-black/10 bg-white p-6 shadow-2xl lg:sticky lg:top-8">
            <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item: any, index: number) => {
                const quantity = Number(item.quantity) || 1;
                const lineTotal = (Number(item.price) || 0) * quantity;
                return (
                  <div key={`${item.id ?? index}-${index}`} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-black">{item.name || `Item ${index + 1}`}</p>
                      <p className="text-black/55">Qty: {quantity}</p>
                    </div>
                    <span className="font-semibold">₹{formatAmount(lineTotal)}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between pt-2 text-xl font-bold">
                <span>Total</span>
                <span>₹{formatAmount(subtotal)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#0065A6]/15 bg-[#0065A6]/5 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-[#0065A6]" />
                <p className="text-sm text-black/70">
                  Your flow now follows: address, payment choice, COD direct order or Razorpay popup verification, then success page.
                </p>
              </div>
            </div>
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
      className={`rounded-3xl border p-5 text-left transition ${
        checked
          ? "border-[#0065A6] bg-[#0065A6] text-white"
          : "border-black/10 bg-white text-black hover:border-[#0065A6]/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span
          className={`h-4 w-4 rounded-full border ${
            checked ? "border-white bg-white" : "border-black/20 bg-transparent"
          }`}
        />
      </div>
      <p className={`mt-3 text-sm ${checked ? "text-white/85" : "text-black/65"}`}>{description}</p>
    </button>
  );
}
