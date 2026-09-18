import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './cartStore';

const resetStore = () => {
  useCartStore.setState({ items: [], isOpen: false });
};

describe('useCartStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts empty and closed', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });

  it('openCart / closeCart toggle isOpen', () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('addToCart adds a new line for a product not already in the cart', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'T-shirt', price: 19.99, quantity: 1, variant: 'M' });
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('addToCart increments quantity for the same productId + variant', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'T-shirt', price: 19.99, quantity: 1, variant: 'M' });
    useCartStore.getState().addToCart({ productId: 1, name: 'T-shirt', price: 19.99, quantity: 2, variant: 'M' });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('addToCart treats a different variant as a separate line', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'T-shirt', price: 19.99, quantity: 1, variant: 'M' });
    useCartStore.getState().addToCart({ productId: 1, name: 'T-shirt', price: 19.99, quantity: 1, variant: 'L' });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('removeFromCart removes only the matching productId/variant line', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'A', price: 10, quantity: 1, variant: 'M' });
    useCartStore.getState().addToCart({ productId: 2, name: 'B', price: 5, quantity: 1 });
    useCartStore.getState().removeFromCart(1, 'M');
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe(2);
  });

  it('updateQuantity clamps to a minimum of 1', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'A', price: 10, quantity: 1 });
    useCartStore.getState().updateQuantity(1, undefined, -5);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('clearCart empties the items array', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'A', price: 10, quantity: 1 });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('getTotal sums price*quantity across every item', () => {
    useCartStore.getState().addToCart({ productId: 1, name: 'A', price: 10, quantity: 2 });
    useCartStore.getState().addToCart({ productId: 2, name: 'B', price: 5, quantity: 3 });
    expect(useCartStore.getState().getTotal()).toBe(10 * 2 + 5 * 3);
  });
});
