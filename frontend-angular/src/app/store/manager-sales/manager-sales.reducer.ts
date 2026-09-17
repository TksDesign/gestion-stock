import { createReducer, on } from '@ngrx/store';
import { SaleResponse, StockItemResponse } from '../features/shop/types/shop.types';
import { ManagerSalesActions } from './manager-sales.actions';

export interface ManagerSalesState {
  stockItems: StockItemResponse[];
  sales: SaleResponse[];
  isStockLoading: boolean;
  isSalesLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: ManagerSalesState = {
  stockItems: [],
  sales: [],
  isStockLoading: false,
  isSalesLoading: false,
  isCreating: false,
  error: null,
};

export const managerSalesReducer = createReducer(
  initialState,
  on(ManagerSalesActions.loadStock, (state) => ({ ...state, isStockLoading: true, error: null })),
  on(ManagerSalesActions.loadStockSuccess, (state, { items }) => ({ ...state, stockItems: items, isStockLoading: false })),
  on(ManagerSalesActions.loadStockFailure, (state, { error }) => ({ ...state, error, isStockLoading: false })),
  
  on(ManagerSalesActions.loadSales, (state) => ({ ...state, isSalesLoading: true, error: null })),
  on(ManagerSalesActions.loadSalesSuccess, (state, { sales }) => ({ ...state, sales, isSalesLoading: false })),
  on(ManagerSalesActions.loadSalesFailure, (state, { error }) => ({ ...state, error, isSalesLoading: false })),
  
  on(ManagerSalesActions.createSale, (state) => ({ ...state, isCreating: true })),
  on(ManagerSalesActions.createSaleSuccess, (state, { sale }) => ({ 
    ...state, 
    sales: [sale, ...state.sales], 
    isCreating: false 
  })),
  on(ManagerSalesActions.createSaleFailure, (state, { error }) => ({ ...state, error, isCreating: false }))
);
