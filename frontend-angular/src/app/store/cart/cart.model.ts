export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export const initialCartState: CartState = {
  items: [],
  isOpen: false,
};
