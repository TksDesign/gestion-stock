import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string; // e.g. "Color : Red" or "Size: M"
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, variant?: string) => void;
  updateQuantity: (productId: number, variant: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addToCart: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === newItem.productId && i.variant === newItem.variant
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId && i.variant === newItem.variant
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      removeFromCart: (productId, variant) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.productId === productId && i.variant === variant)),
        }));
      },
      updateQuantity: (productId, variant, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variant === variant
              ? { ...i, quantity: Math.max(1, quantity) } 
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
