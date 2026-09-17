import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ManagerStockState } from './manager-stock.reducer';

export const selectManagerStockState = createFeatureSelector<ManagerStockState>('managerStock');

export const selectStockItems = createSelector(selectManagerStockState, (state) => state.items);
export const selectStockCategories = createSelector(selectManagerStockState, (state) => state.categories);
export const selectStockLoading = createSelector(selectManagerStockState, (state) => state.isLoading);
export const selectStockCreating = createSelector(selectManagerStockState, (state) => state.isCreating);
export const selectStockUpdating = createSelector(selectManagerStockState, (state) => state.isUpdating);
