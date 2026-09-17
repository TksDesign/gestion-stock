import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SaleRequest, SaleResponse, StockItemResponse } from '../features/shop/types/shop.types';

export const ManagerSalesActions = createActionGroup({
  source: 'Manager Sales',
  events: {
    'Load Stock': emptyProps(),
    'Load Stock Success': props<{ items: StockItemResponse[] }>(),
    'Load Stock Failure': props<{ error: string }>(),
    'Load Sales': emptyProps(),
    'Load Sales Success': props<{ sales: SaleResponse[] }>(),
    'Load Sales Failure': props<{ error: string }>(),
    'Create Sale': props<{ data: SaleRequest }>(),
    'Create Sale Success': props<{ sale: SaleResponse }>(),
    'Create Sale Failure': props<{ error: string }>(),
  }
});
