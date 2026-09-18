import { CartActions } from './cart.actions';
import { cartReducer } from './cart.reducer';
import { CartItem, CartState, initialCartState } from './cart.model';

describe('cartReducer', () => {
  const item1: CartItem = { productId: 1, name: 'T-shirt', price: 19.99, quantity: 1, variant: 'M' };
  const item2: CartItem = { productId: 2, name: 'Cap', price: 9.99, quantity: 1 };

  it('returns the initial state for an unknown action', () => {
    const state = cartReducer(undefined, { type: '@@INIT' } as any);
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });

  it('openCart sets isOpen to true', () => {
    const state = cartReducer(initialCartState, CartActions.openCart());
    expect(state.isOpen).toBe(true);
  });

  it('closeCart sets isOpen to false', () => {
    const opened: CartState = { ...initialCartState, isOpen: true };
    const state = cartReducer(opened, CartActions.closeCart());
    expect(state.isOpen).toBe(false);
  });

  it('addToCart adds a new item when it is not already in the cart', () => {
    const state = cartReducer(initialCartState, CartActions.addToCart({ item: item1 }));
    expect(state.items).toEqual([item1]);
  });

  it('addToCart increments the quantity of an existing item with the same productId and variant', () => {
    const withItem: CartState = { ...initialCartState, items: [item1] };
    const state = cartReducer(withItem, CartActions.addToCart({ item: { ...item1, quantity: 2 } }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('addToCart treats a different variant of the same product as a separate line', () => {
    const withItem: CartState = { ...initialCartState, items: [item1] };
    const otherVariant = { ...item1, variant: 'L' };
    const state = cartReducer(withItem, CartActions.addToCart({ item: otherVariant }));
    expect(state.items).toHaveLength(2);
  });

  it('removeFromCart removes only the matching productId/variant line', () => {
    const withItems: CartState = { ...initialCartState, items: [item1, item2] };
    const state = cartReducer(withItems, CartActions.removeFromCart({ productId: 1, variant: 'M' }));
    expect(state.items).toEqual([item2]);
  });

  it('updateQuantity clamps the quantity to a minimum of 1', () => {
    const withItem: CartState = { ...initialCartState, items: [item1] };
    const state = cartReducer(withItem, CartActions.updateQuantity({ productId: 1, variant: 'M', quantity: -5 }));
    expect(state.items[0].quantity).toBe(1);
  });

  it('updateQuantity updates the matching line only', () => {
    const withItems: CartState = { ...initialCartState, items: [item1, item2] };
    const state = cartReducer(withItems, CartActions.updateQuantity({ productId: 1, variant: 'M', quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
    expect(state.items[1].quantity).toBe(1);
  });

  it('clearCart empties the items array without touching isOpen', () => {
    const withItems: CartState = { ...initialCartState, items: [item1, item2], isOpen: true };
    const state = cartReducer(withItems, CartActions.clearCart());
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(true);
  });

  it('hydrate replaces the whole state with the persisted one', () => {
    const persisted: CartState = { items: [item2], isOpen: true };
    const state = cartReducer(initialCartState, CartActions.hydrate({ state: persisted }));
    expect(state).toEqual(persisted);
  });
});
