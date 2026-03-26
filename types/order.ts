export interface CheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
}