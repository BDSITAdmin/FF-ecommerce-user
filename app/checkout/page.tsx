"use client";

import { useEffect } from 'react';
import { ArrowLeft, Truck, CreditCard, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Navbar from '@/components/Navbar';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';


export default function CheckoutPage() {
  const { form, currentStep, nextStep, prevStep, isSubmitting, submitError, submitSuccess, formErrors, shippingAddress, isValid } = useCheckoutForm();
  const cartItems = useSelector((state: any) => state.cart.items);
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

  const steps = [
    { id: 'address', title: 'Address', icon: MapPin },
    { id: 'shipping', title: 'Shipping', icon: Truck },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'review', title: 'Review', icon: CheckCircle },
  ];

  const StepContent = () => {
    switch (currentStep) {
      case 'address':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input {...form.register('firstName')} className="w-full p-3 border rounded-lg" />
              {formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input {...form.register('lastName')} className="w-full p-3 border rounded-lg" />
              {formErrors.lastName && <p className="text-red-500 text-sm">{formErrors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input {...form.register('email')} type="email" className="w-full p-3 border rounded-lg" />
              {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input {...form.register('phone')} className="w-full p-3 border rounded-lg" />
              {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone.message}</p>}
            </div>
          </div>
        );
      case 'shipping':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input {...form.register('address')} className="w-full p-3 border rounded-lg" />
              {formErrors.address && <p className="text-red-500 text-sm">{formErrors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input {...form.register('city')} className="w-full p-3 border rounded-lg" />
                {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input {...form.register('state')} className="w-full p-3 border rounded-lg" />
                {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                <input {...form.register('zipCode')} className="w-full p-3 border rounded-lg" />
                {formErrors.zipCode && <p className="text-red-500 text-sm">{formErrors.zipCode.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <select {...form.register('country')} className="w-full p-3 border rounded-lg">
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="AE">UAE</option>
                </select>
                {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country.message}</p>}
              </div>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="RAZORPAY" {...form.register('paymentMethod')} className="rounded" />
                  <span>Razorpay (Card/UPI)</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="COD" {...form.register('paymentMethod')} className="rounded" />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...form.register('saveInfo')} />
              <label>Save this information for next time</label>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="font-semibold">{shippingAddress.name}</p>
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
                <p className="text-sm text-gray-500">{shippingAddress.phone}</p>
              </div>
            </div>
            {submitError && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{submitError}</div>}
            {submitSuccess && <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{submitSuccess}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/cart" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 inline-flex">
          <ArrowLeft size={20} />
          Back to Cart
        </Link>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${idx <= steps.findIndex(s => s.id === currentStep)
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                    }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs ${idx <= steps.findIndex(s => s.id === currentStep) ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                style={{ width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          {/* Step Content */}
          <StepContent />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
            {currentStep !== 'address' && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <ArrowLeft size={20} />
                Previous
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={nextStep}
              disabled={isSubmitting || !isValid}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Processing...' : currentStep === 'review' ? 'Place Order' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
