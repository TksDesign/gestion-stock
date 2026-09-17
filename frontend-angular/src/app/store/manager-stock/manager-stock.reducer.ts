import { createReducer, on } from '@ngrx/store';
import { CategoryResponse, StockItemResponse } from '../../features/shop/types/shop.types';
import { ManagerStockActions } from './manager-stock.actions';

export interface ManagerStockState {
  items: StockItemResponse[];
  categories: CategoryResponse[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: ManagerStockState = {
  items: [],
  categories: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

export const managerStockReducer = createReducer(
  initialState,
  on(ManagerStockActions.loadStock, (state) => ({ ...state, isLoading: true, error: null })),
  on(ManagerStockActions.loadStockSuccess, (state, { items }) => ({ ...state, items, isLoading: false })),
  on(ManagerStockActions.loadStockFailure, (state, { error }) => ({ ...state, error, isLoading: false })),
  
  on(ManagerStockActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories })),
  
  on(ManagerStockActions.createItem, (state) => ({ ...state, isCreating: true })),
  on(ManagerStockActions.createItemSuccess, (state, { item }) => ({ ...state, items: [...state.items, item], isCreating: false })),
  on(ManagerStockActions.createItemFailure, (state, { error }) => ({ ...state, error, isCreating: false })),
  
  on(ManagerStockActions.updateItem, ManagerStockActions.adjustQuantity, (state) => ({ ...state, isUpdating: true })),
  on(ManagerStockActions.updateItemSuccess, ManagerStockActions.adjustQuantitySuccess, (state, { item }) => ({ 
    ...state, 
    items: state.items.map(i => i.id === item.id ? item : i), 
    isUpdating: false 
  })),
  on(ManagerStockActions.updateItemFailure, ManagerStockActions.adjustQuantityFailure, (state, { error }) => ({ ...state, error, isUpdating: false })),
  
  on(ManagerStockActions.deleteItemSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter(i => i.id !== id)
  }))
);
