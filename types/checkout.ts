import { z } from "zod";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
});

export const shippingSchema = z.object({
  address: z.string().trim().min(1, "Address is required"),
  apartment: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zipCode: z.string().trim().min(3, "ZIP code is required"),
  country: z.enum(["IN", "US", "AE"]),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  saveInfo: z.boolean(),
});

export const checkoutSchema = addressSchema
  .merge(shippingSchema)
  .merge(paymentSchema);

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export interface FormErrors {
  [key: string]: string;
}
