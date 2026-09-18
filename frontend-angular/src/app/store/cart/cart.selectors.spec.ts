import { selectCartCount, selectCartIsOpen, selectCartItems, selectCartTotal } from './cart.selectors';
import { cartFeatureKey } from './cart.reducer';
import { CartItem, CartState } from './cart.model';

describe('cart selectors', () => {
  const items: CartItem[] = [
    { productId: 1, name: 'T-shirt', price: 20, quantity: 2 },
    { productId: 2, name: 'Cap', price: 10, quantity: 3 },
  ];
  const cartState: CartState = { items, isOpen: true };
  const state = { [cartFeatureKey]: cartState };

  it('selectCartItems returns the items array', () => {
    expect(selectCartItems(state as any)).toEqual(items);
  });

  it('selectCartIsOpen returns the isOpen flag', () => {
    expect(selectCartIsOpen(state as any)).toBe(true);
  });

  it('selectCartCount sums the quantities of every item', () => {
    expect(selectCartCount(state as any)).toBe(5);
  });

  it('selectCartTotal sums price*quantity across every item', () => {
    expect(selectCartTotal(state as any)).toBe(20 * 2 + 10 * 3);
  });

  it('selectCartCount returns 0 for an empty cart', () => {
    const empty = { [cartFeatureKey]: { items: [], isOpen: false } };
    expect(selectCartCount(empty as any)).toBe(0);
  });
});
