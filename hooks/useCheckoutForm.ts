import { useCallback, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { clearCartAsync } from "../store/cartSlice";
import {
  CheckoutFormData,
  checkoutSchema,
  addressSchema,
  shippingSchema,
  paymentSchema,
} from "../types/checkout";

import { checkout, verifyRazorpayPayment } from "../services/checkout.service";
import {
  openRazorpayCheckout,
  RazorpayPaymentResponse,
} from "../services/razorpay-checkout";

type Step = "address" | "shipping" | "payment" | "review";

const steps: Step[] = ["address", "shipping", "payment", "review"];

export const useCheckoutForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: any) => state.cart.items as Array<Record<string, any>>);

  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const stepSchemas = useMemo(() => {
    return {
      address: addressSchema,
      shipping: shippingSchema,
      payment: paymentSchema,
      review: z.object({}),
    } satisfies Record<Step, z.ZodTypeAny>;
  }, []);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),

    // 🔥 MUST MATCH schema
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      country: "IN",
      paymentMethod: "RAZORPAY",
      saveInfo: false,
    },

    mode: "onChange",
  });

  const values = form.watch();
  const isStepValid = useMemo(() => {
    const result = stepSchemas[currentStep].safeParse(values);
    return result.success;
  }, [currentStep, stepSchemas, values]);

  const shippingAddress = useMemo(() => {
    const {
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      zipCode,
      phone,
      country,
    } = values;

    return {
      name: `${firstName} ${lastName}`.trim(),
      phone,
      street: [address, apartment].filter(Boolean).join(", "),
      city,
      state,
      country,
      zipCode,
    };
  }, [values]);

  const extractOrderId = useCallback((value: unknown) => {
    if (!value || typeof value !== "object") return "";

    const record = value as Record<string, any>;
    const data =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, any>)
        : null;

    return (
      record.orderId ??
      record.id ??
      data?.orderId ??
      data?.id ??
      data?.order?.id ??
      record.order?.id ??
      ""
    );
  }, []);

  const extractProductId = useCallback((value: unknown) => {
    if (!value || typeof value !== "object") return "";

    const record = value as Record<string, any>;
    const data =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, any>)
        : null;

    const order =
      record.order ??
      data?.order ??
      record;

    const items =
      order?.items ??
      data?.items ??
      record.items ??
      [];

    if (!Array.isArray(items) || !items.length) return "";

    const firstItem = items[0] ?? {};

    return String(
      firstItem.productId ??
      firstItem.product?.id ??
      firstItem.product?._id ??
      firstItem.id ??
      ""
    );
  }, []);

  const firstCartProductId = useMemo(() => {
    const firstItem = cartItems?.[0] as Record<string, any> | undefined;
    if (!firstItem) return "";

    return String(
      firstItem.id ??
      firstItem._id ??
      firstItem.productId ??
      firstItem.product?.id ??
      firstItem.product?._id ??
      ""
    );
  }, [cartItems]);

  const redirectToProductDetails = useCallback(
    (candidateProductId?: string) => {
      const resolvedProductId = String(candidateProductId || "").trim() || firstCartProductId;

      if (resolvedProductId) {
        window.setTimeout(() => {
          router.replace(`/products/${resolvedProductId}`);
        }, 1200);
        return;
      }

      window.setTimeout(() => {
        router.replace("/products");
      }, 1200);
    },
    [firstCartProductId, router]
  );

  // ─── STEP NAVIGATION ─────────────────

  const nextStep = useCallback(() => {
    if (isSubmitting) return;

    const result = stepSchemas[currentStep].safeParse(form.getValues());

    if (!result.success) {
      form.setError("root", {
        message: "Please fix errors before continuing",
      });
      return;
    }

    const index = steps.indexOf(currentStep);

    if (currentStep === "review") {
      onSubmit(form.getValues());
    } else {
      setCurrentStep(steps[index + 1]);
    }
  }, [currentStep, form, isSubmitting, stepSchemas]);

  const prevStep = useCallback(() => {
    const index = steps.indexOf(currentStep);
    if (index > 0) setCurrentStep(steps[index - 1]);
  }, [currentStep]);

  // ─── SUBMIT ─────────────────────────

  const onSubmit: SubmitHandler<CheckoutFormData> = useCallback(
    async (data) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      try {
        const totalPayFromSession =
          globalThis.window !== undefined
            ? Number(sessionStorage.getItem("checkout_total_pay") || 0)
            : 0;

        const res = await checkout({
          shippingAddress,
          paymentMethod: data.paymentMethod,
          totalPay:
            Number.isFinite(totalPayFromSession) && totalPayFromSession > 0
              ? totalPayFromSession
              : undefined,
        });

        const session = res?.data?.data || res?.data;
        const createdOrderId = extractOrderId(session) || extractOrderId(res?.data);

        // ✅ COD FLOW
        if (data.paymentMethod === "COD") {
          const createdProductId =
            extractProductId(session) ||
            extractProductId(res?.data);

          setSubmitSuccess("Order placed successfully! Redirecting to product details...");
          dispatch(clearCartAsync());
          redirectToProductDetails(createdProductId);
          return;
        }

        if (!session?.razorpayOrderId) {
          throw new Error("Invalid payment session");
        }

        const payment: RazorpayPaymentResponse =
          await openRazorpayCheckout({
            key: session.key,
            order_id: session.razorpayOrderId,
            amount: session.amount,
            currency: "INR",

            name: "Ecommerce",
            description: "Order Payment",

            prefill: {
              name: shippingAddress.name,
              email: data.email,
              contact: data.phone,
            },
          });

        // ✅ FIXED (no spread error)
        const verifyRes = await verifyRazorpayPayment({
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_signature: payment.razorpay_signature,
          checkoutId: session.checkoutId,
        });

        const verifiedOrderId =
          extractOrderId(verifyRes?.data) ||
          extractOrderId(verifyRes?.data?.data) ||
          createdOrderId;

        const paidProductId =
          extractProductId(verifyRes?.data) ||
          extractProductId(verifyRes?.data?.data) ||
          extractProductId(session) ||
          extractProductId(res?.data);

        setSubmitSuccess("Payment successful! Redirecting to product details...");
        dispatch(clearCartAsync());

        // Keep order id extraction for compatibility with existing API payload shapes.
        void verifiedOrderId;
        redirectToProductDetails(paidProductId);
      } catch (error: any) {
        setSubmitError(error?.message || "Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, extractOrderId, extractProductId, isSubmitting, redirectToProductDetails, shippingAddress]
  );

  const submitOrder = useMemo(() => form.handleSubmit(onSubmit), [form, onSubmit]);

  return {
    form,
    currentStep,
    nextStep,
    prevStep,
    isSubmitting,
    submitError,
    submitSuccess,
    formErrors: form.formState.errors,
    shippingAddress,
    isValid: isStepValid,
    submitOrder,
  };
};
