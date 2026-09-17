import { createReducer, on } from '@ngrx/store';
import { CartActions } from './cart.actions';
import { initialCartState } from './cart.model';
import { hydrateFeature } from '../persist.meta-reducer';
import { cartFeatureKey } from '../feature-keys';

export { cartFeatureKey };

export const cartReducer = createReducer(
  hydrateFeature(cartFeatureKey, initialCartState),
  on(CartActions.openCart, (state) => ({ ...state, isOpen: true })),
  on(CartActions.closeCart, (state) => ({ ...state, isOpen: false })),
  on(CartActions.addToCart, (state, { item }) => {
    const existing = state.items.find((i) => i.productId === item.productId && i.variant === item.variant);
    if (existing) {
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === item.productId && i.variant === item.variant
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        ),
      };
    }
    return { ...state, items: [...state.items, item] };
  }),
  on(CartActions.removeFromCart, (state, { productId, variant }) => ({
    ...state,
    items: state.items.filter((i) => !(i.productId === productId && i.variant === variant)),
  })),
  on(CartActions.updateQuantity, (state, { productId, variant, quantity }) => ({
    ...state,
    items: state.items.map((i) =>
      i.productId === productId && i.variant === variant ? { ...i, quantity: Math.max(1, quantity) } : i,
    ),
  })),
  on(CartActions.clearCart, (state) => ({ ...state, items: [] })),
  on(CartActions.hydrate, (_state, { state }) => state),
);
