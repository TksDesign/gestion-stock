import { createFeatureSelector, createSelector } from '@ngrx/store';
import { cartFeatureKey } from './cart.reducer';
import { CartState } from './cart.model';

export const selectCartState = createFeatureSelector<CartState>(cartFeatureKey);
export const selectCartItems = createSelector(selectCartState, (s) => s.items);
export const selectCartIsOpen = createSelector(selectCartState, (s) => s.isOpen);
export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((total, i) => total + i.quantity, 0),
);
export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((total, i) => total + i.price * i.quantity, 0),
);
