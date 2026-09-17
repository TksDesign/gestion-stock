import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShopSettingsState } from './shop-settings.reducer';

export const selectShopSettingsState = createFeatureSelector<ShopSettingsState>('shopSettings');

export const selectShopData = createSelector(selectShopSettingsState, (state) => state.shop);
export const selectShopLoading = createSelector(selectShopSettingsState, (state) => state.isLoading);
export const selectShopUpdating = createSelector(selectShopSettingsState, (state) => state.isUpdating);
export const selectShopError = createSelector(selectShopSettingsState, (state) => state.error);
