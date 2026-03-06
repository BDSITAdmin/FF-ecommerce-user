// types/checkout.ts
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  saveInfo: boolean;
}

export interface FormErrors {
  [key: string]: string;
}
