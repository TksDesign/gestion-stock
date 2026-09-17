import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ManagerSalesState } from './manager-sales.reducer';

export const selectManagerSalesState = createFeatureSelector<ManagerSalesState>('managerSales');

export const selectSalesStockItems = createSelector(selectManagerSalesState, (state) => state.stockItems);
export const selectSalesHistory = createSelector(selectManagerSalesState, (state) => state.sales);
export const selectSalesStockLoading = createSelector(selectManagerSalesState, (state) => state.isStockLoading);
export const selectSalesHistoryLoading = createSelector(selectManagerSalesState, (state) => state.isSalesLoading);
export const selectSalesCreating = createSelector(selectManagerSalesState, (state) => state.isCreating);
