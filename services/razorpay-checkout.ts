// ✅ Razorpay response type
export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export const openRazorpayCheckout = async (
  options: any
): Promise<RazorpayPaymentResponse> => {
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      ...options,

      handler: function (response: RazorpayPaymentResponse) {
        resolve(response);
      },

      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    rzp.open();
  });
};