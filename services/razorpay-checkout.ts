// ✅ Razorpay response type
export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

let razorpayScriptPromise: Promise<boolean> | null = null;

// ✅ Load script first
const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async (
  options: any
): Promise<RazorpayPaymentResponse> => {
  // ✅ IMPORTANT: wait for script
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    throw new Error("Razorpay SDK failed to load");
  }

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