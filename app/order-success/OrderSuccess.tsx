"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Package, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/services/api";
import Navbar from "@/components/Navbar";
import { sendOrderConfirmation } from "@/services/checkout.service";

export default function OrderSuccess({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [notificationsSent, setNotificationsSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderAndNotify = async () => {
      try {
        // Fetch order
        const res = await api.get(`/orders/${orderId}`);
        const orderData = res.data.data;
        setOrder(orderData);

        // Prepare contact details
        const email =
          orderData.customerEmail ||
          orderData.shippingAddress?.email ||
          "customer@example.com";

        const phone =
          orderData.customerPhone ||
          orderData.shippingAddress?.phone ||
          "+919876543210";

        // Send notification
        const notificationRes = await sendOrderConfirmation(
          orderId,
          email,
          phone
        );

        if (notificationRes?.success) {
          setNotificationsSent(true);
        }
      } catch (error) {
        console.error("Order fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndNotify();
  }, [orderId]);

  // 🔄 Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your order...</p>
        </div>
      </div>
    );
  }

  // ❌ Order not found
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Order not found</h1>
          <Link href="/cart">Back to Cart</Link>
        </div>
      </div>
    );
  }

  // ✅ Success UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-white shadow-xl rounded-3xl p-10">
          
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />

          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="mb-6">Thank you for your purchase.</p>

          <div className="mb-6">
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <p><strong>Status:</strong> {order.status || "Confirmed"}</p>
          </div>

          {notificationsSent && (
            <p className="text-green-600 mb-4">
              ✓ Email & SMS sent
            </p>
          )}

          <div className="flex gap-4 justify-center mt-6">
            <Link href="/products" className="px-6 py-2 border border-green-600 text-green-600 rounded">
              Continue Shopping
            </Link>

            <Link href="/orders" className="px-6 py-2 bg-green-600 text-white rounded">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}