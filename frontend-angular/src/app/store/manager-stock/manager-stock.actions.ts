import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StockAdjustmentRequest, StockItemRequest, StockItemResponse, CategoryResponse } from '../features/shop/types/shop.types';

export const ManagerStockActions = createActionGroup({
  source: 'Manager Stock',
  events: {
    'Load Stock': emptyProps(),
    'Load Stock Success': props<{ items: StockItemResponse[] }>(),
    'Load Stock Failure': props<{ error: string }>(),
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: CategoryResponse[] }>(),
    'Load Categories Failure': props<{ error: string }>(),
    'Create Item': props<{ data: StockItemRequest }>(),
    'Create Item Success': props<{ item: StockItemResponse }>(),
    'Create Item Failure': props<{ error: string }>(),
    'Update Item': props<{ id: number; data: StockItemRequest }>(),
    'Update Item Success': props<{ item: StockItemResponse }>(),
    'Update Item Failure': props<{ error: string }>(),
    'Adjust Quantity': props<{ id: number; data: StockAdjustmentRequest }>(),
    'Adjust Quantity Success': props<{ item: StockItemResponse }>(),
    'Adjust Quantity Failure': props<{ error: string }>(),
    'Delete Item': props<{ id: number }>(),
    'Delete Item Success': props<{ id: number }>(),
    'Delete Item Failure': props<{ error: string }>(),
  }
});
