import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ShopRequest, ShopResponse } from '../features/shop/types/shop.types';

export const ShopSettingsActions = createActionGroup({
  source: 'Shop Settings',
  events: {
    'Load Shop': emptyProps(),
    'Load Shop Success': props<{ shop: ShopResponse }>(),
    'Load Shop Failure': props<{ error: string }>(),
    'Update Shop': props<{ data: ShopRequest }>(),
    'Update Shop Success': props<{ shop: ShopResponse }>(),
    'Update Shop Failure': props<{ error: string }>(),
  }
});
