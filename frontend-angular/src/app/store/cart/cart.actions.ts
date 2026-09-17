import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CartItem, CartState } from './cart.model';

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    'Open Cart': emptyProps(),
    'Close Cart': emptyProps(),
    'Add To Cart': props<{ item: CartItem }>(),
    'Remove From Cart': props<{ productId: number; variant?: string }>(),
    'Update Quantity': props<{ productId: number; variant: string | undefined; quantity: number }>(),
    'Clear Cart': emptyProps(),
    'Hydrate': props<{ state: CartState }>(),
  },
});
