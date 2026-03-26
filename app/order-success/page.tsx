"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from "@/services/api";
import Navbar from '@/components/Navbar';
import { sendOrderConfirmation } from '@/services/checkout.service';

export default function OrderSuccess() {
  const [order, setOrder] = useState<any>(null);
  const [notificationsSent, setNotificationsSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderAndNotify = async () => {
      try {
        // Fetch order details
        const res = await api.get(`/orders/${orderId}`);
        const orderData = res.data.data;
        setOrder(orderData);

        // Send notifications (email + SMS)
        const email = orderData.customerEmail || orderData.shippingAddress?.email || 'customer@example.com';
        const phone = orderData.customerPhone || orderData.shippingAddress?.phone || '+919876543210';
        
        const notificationRes = await sendOrderConfirmation(orderId, email, phone);
        
        if (notificationRes.success) {
          setNotificationsSent(true);
        }
      } catch (error) {
        console.error('Order fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndNotify();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order not found</h1>
          <Link href="/cart" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all">
            <ArrowRight className="rotate-180" size={20} />
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-12 text-center border border-white/50">
          {/* Success Icon */}
          <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <CheckCircle className="w-20 h-20 text-white" />
          </div>

          {/* Main Success Message */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for your purchase. Your order has been received and we're preparing it for delivery.
          </p>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-b from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-mono text-lg">
                  <span>ID:</span>
                  <span className="font-bold">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-2xl text-green-600">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-600">{order.status || 'Confirmed'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.phone}</p>
                {notificationsSent && (
                  <p className="text-emerald-600 text-xs mt-4 flex items-center gap-1">
                    ✓ Confirmation email & SMS sent
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all">
              <Truck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Track Order</h4>
              <p className="text-sm text-gray-600">We'll notify you when your order ships</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
              <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Reorder</h4>
              <p className="text-sm text-gray-600">Quick reorder from your history</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
              <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Support</h4>
              <p className="text-sm text-gray-600">Questions? Contact us anytime</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-16 pt-12 border-t border-gray-100">
            <Link 
              href="/products" 
              className="flex-1 bg-white text-green-600 border border-green-600 hover:bg-green-600 hover:text-white font-semibold py-4 px-8 rounded-2xl text-center transition-all shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/orders" 
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-8 rounded-2xl text-center transition-all shadow-lg hover:shadow-xl"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

