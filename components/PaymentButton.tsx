"use client";

import api from "@/services/api";
import { loadRazorpay } from "@/services/razorpay";

const PaymentButton = () => {
  const handlePayment = async () => {
    const loaded = await loadRazorpay();

    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      // ✅ 1. Call Checkout API
      const { data } = await api.post("/api/v1/checkout", {
        shippingAddress: {
          name: "John Doe",
          phone: "9876543210",
          street: "221B Baker Street",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400001",
        },
        paymentMethod: "RAZORPAY",
      });

      const order = data.data;

      // ✅ 2. Razorpay Options (FULL CONFIG)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BigDoor IT Solutions",
        description: "Order Payment",
        order_id: order.razorpayOrderId,

        // 🔥 SUCCESS HANDLER
        handler: async function (response: any) {
          await verifyPayment(response, order.orderId);
        },

        // 🔥 PREFILL
        prefill: {
          name: "John Doe",
          contact: "9876543210",
        },

        // 🔥 UPI + ALL METHODS
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },

        // 🔥 UPI INTENT (OPEN GPay / PhonePe)
        upi: {
          flow: "intent",
        },

        // 🔥 UI CUSTOMIZATION
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi"], // show UPI first
            preferences: {
              show_default_blocks: true,
            },
          },
        },

        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);

      // ❌ PAYMENT FAILED
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response.error);
        alert("❌ Payment Failed. Try again.");
      });

      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed");
    }
  };

  // ✅ VERIFY PAYMENT
  const verifyPayment = async (response: any, orderId: string) => {
    try {
      await api.post("/api/v1/payment/verify", {
        orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      // ✅ REDIRECT
      window.location.href = `/order-success?orderId=${orderId}`;
    } catch (error) {
      console.error("Verification failed:", error);
      alert("❌ Payment verification failed");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-6 py-3 bg-green-600 text-white rounded"
    >
      Pay Now
    </button>
  );
};

export default PaymentButton;