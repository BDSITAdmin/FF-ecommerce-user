import { useCallback, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";

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

  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const stepSchemas = useMemo(() => {
    return {
      address: addressSchema,
      shipping: shippingSchema,
      payment: paymentSchema,
      // No fields on review screen; reaching it already implies prior steps validated.
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
      country: "IN", // ✅ FIXED
      paymentMethod: "RAZORPAY",
      saveInfo: false,
    },

    mode: "onChange",
  });

  const values = form.watch();

  // `react-hook-form`'s `formState.isValid` reflects the *entire* resolver schema.
  // For a multi-step form, we want "valid for the current step" so users can proceed.
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
        const res = await checkout({
          shippingAddress,
          paymentMethod: data.paymentMethod,
        });

        // ✅ COD FLOW
        if (data.paymentMethod === "COD") {
          setSubmitSuccess("Order placed successfully");
          dispatch(clearCartAsync());
          return;
        }

        const session = res?.data?.data || res?.data;

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
        await verifyRazorpayPayment({
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_signature: payment.razorpay_signature,
          checkoutId: session.checkoutId,
        });

        setSubmitSuccess("Payment successful ✅");
        dispatch(clearCartAsync());
      } catch (error: any) {
        setSubmitError(error?.message || "Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, shippingAddress, isSubmitting]
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
