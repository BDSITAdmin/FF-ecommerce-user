// components/PaymentMethod.tsx
import React from 'react';
import { CheckoutFormData } from '../types/checkout';
import { Banknote, Building2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodProps {
  formData: CheckoutFormData;
  errors: { [key: string]: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ formData, errors, onChange }) => {
  const inputClass = (hasError?: boolean) =>
    `mt-2 block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
      hasError
        ? 'border-rose-300 ring-2 ring-rose-200'
        : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
    }`;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    e.target.value = formatted;
    onChange(e);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
    onChange(e);
  };

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 p-6 md:p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-5">Payment Method</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label
          className={`rounded-2xl border p-4 cursor-pointer transition ${
            formData.paymentMethod === 'upi'
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="upi"
            checked={formData.paymentMethod === 'upi'}
            onChange={onChange}
            className="sr-only"
          />
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">UPI</p>
              <p className="text-xs text-slate-500">GPay, PhonePe, Paytm</p>
            </div>
          </div>
        </label>

        <label
          className={`rounded-2xl border p-4 cursor-pointer transition ${
            formData.paymentMethod === 'card'
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={formData.paymentMethod === 'card'}
            onChange={onChange}
            className="sr-only"
          />
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Card</p>
              <p className="text-xs text-slate-500">Credit / Debit</p>
            </div>
          </div>
        </label>

        <label
          className={`rounded-2xl border p-4 cursor-pointer transition ${
            formData.paymentMethod === 'netbanking'
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="netbanking"
            checked={formData.paymentMethod === 'netbanking'}
            onChange={onChange}
            className="sr-only"
          />
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Net Banking</p>
              <p className="text-xs text-slate-500">All major Indian banks</p>
            </div>
          </div>
        </label>

        <label
          className={`rounded-2xl border p-4 cursor-pointer transition ${
            formData.paymentMethod === 'cod'
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={formData.paymentMethod === 'cod'}
            onChange={onChange}
            className="sr-only"
          />
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Cash on Delivery</p>
              <p className="text-xs text-slate-500">Pay when order arrives</p>
            </div>
          </div>
        </label>
      </div>

      {formData.paymentMethod === 'upi' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <label htmlFor="upiId" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            UPI ID
          </label>
          <input
            type="text"
            id="upiId"
            name="upiId"
            value={formData.upiId || ''}
            onChange={onChange}
            placeholder="yourname@upi"
            className={inputClass(Boolean(errors.upiId))}
          />
          {errors.upiId && (
            <p className="mt-1 text-sm text-rose-600">{errors.upiId}</p>
          )}
        </div>
      )}

      {formData.paymentMethod === 'card' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={inputClass(Boolean(errors.cardNumber))}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-rose-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cardExpiry" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expiry Date
              </label>
              <input
                type="text"
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className={inputClass(Boolean(errors.cardExpiry))}
              />
              {errors.cardExpiry && (
                <p className="mt-1 text-sm text-rose-600">{errors.cardExpiry}</p>
              )}
            </div>

            <div>
              <label htmlFor="cardCvc" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                CVC
              </label>
              <input
                type="text"
                id="cardCvc"
                name="cardCvc"
                value={formData.cardCvc}
                onChange={onChange}
                placeholder="123"
                maxLength={4}
                className={inputClass(Boolean(errors.cardCvc))}
              />
              {errors.cardCvc && (
                <p className="mt-1 text-sm text-rose-600">{errors.cardCvc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
