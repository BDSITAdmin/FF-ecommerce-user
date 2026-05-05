export declare const fetchCart: () => any;

export declare const addToCartAsync: (arg: {
  product: unknown;
  quantity?: number;
}) => any;

export declare const setCartItemQuantityAsync: (arg: {
  product?: unknown;
  productId?: string | number;
  packId?: string;
  packSize?: number;
  quantity: number;
}) => any;

export declare const clearCartAsync: () => any;

export declare const removeFromCartAsync: (
  payload:
    | string
    | number
    | {
        productId: string | number;
        packId?: string;
        packSize?: number;
      }
) => any;

export declare const removeSingleFromCartAsync: (
  payload:
    | string
    | number
    | {
        productId: string | number;
        packId?: string;
        packSize?: number;
      }
) => any;

export declare const addToCart: any;
export declare const removeSingleFromCart: any;
export declare const removeFromCart: any;

declare const reducer: any;
export default reducer;
