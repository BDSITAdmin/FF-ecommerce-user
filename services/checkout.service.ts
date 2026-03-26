import api from "./api";
import { sendOrderNotifications } from "./aws-notifications";
import { AxiosError } from "axios";

// ─── Checkout ─────────────────────────

export const checkout = (data: {
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: "RAZORPAY" | "COD";
}) => {
  return api.post("/api/v1/checkout", data);
};

// ─── Verify Payment ───────────────────

export const verifyRazorpayPayment = async (
  payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    checkoutId: any;
  },
  paths: string[] = []
) => {
  const candidates = [
    ...(Array.isArray(paths) ? paths : []),
    "/api/v1/checkout/payment/verify",
    "/api/v1/checkout/webhook/razorpay",
  ].filter(Boolean);

  let lastError: unknown;

  for (const path of candidates) {
    try {
      const res = await api.post(path, payload);
      return res;
    } catch (err: unknown) {
      // ✅ FIXED
      if (err instanceof AxiosError) {
        const status = err.response?.status;

        if (status === 404 || status === 405) {
          lastError = err;
          continue;
        }
      }

      throw err;
    }
  }

  if (lastError) throw lastError;
  throw new Error("Razorpay verify endpoint not available");
};

// ─── Notifications ───────────────────

export const sendOrderConfirmation = async (
  orderId: string,
  email: string,
  phone: string
) => {
  try {
    const orderRes = await api.get(`/orders/${orderId}`);
    const orderDetails = orderRes.data.data;

    await sendOrderNotifications(email, phone, orderId, orderDetails);

    return { success: true };
  } catch (error: unknown) {
    console.error("Notification error:", error);

    return {
      success: false,
      error,
    };
  }
};