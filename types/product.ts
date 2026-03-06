export type Product = {
  id: string;
  name: string;
  price: number | string;
  images?: string[];
  stock?: number | string;
  category?: string;
  description?: string;
  compareAtPrice?: number | string;
  rating?: number;
  reviews?: number;
};
