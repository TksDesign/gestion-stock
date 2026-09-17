import { createReducer, on } from '@ngrx/store';
import { ShopResponse } from '../features/shop/types/shop.types';
import { ShopSettingsActions } from './shop-settings.actions';

export interface ShopSettingsState {
  shop: ShopResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: ShopSettingsState = {
  shop: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

export const shopSettingsReducer = createReducer(
  initialState,
  on(ShopSettingsActions.loadShop, (state) => ({ ...state, isLoading: true, error: null })),
  on(ShopSettingsActions.loadShopSuccess, (state, { shop }) => ({ ...state, shop, isLoading: false })),
  on(ShopSettingsActions.loadShopFailure, (state, { error }) => ({ ...state, error, isLoading: false })),
  
  on(ShopSettingsActions.updateShop, (state) => ({ ...state, isUpdating: true })),
  on(ShopSettingsActions.updateShopSuccess, (state, { shop }) => ({ ...state, shop, isUpdating: false })),
  on(ShopSettingsActions.updateShopFailure, (state, { error }) => ({ ...state, error, isUpdating: false }))
);
