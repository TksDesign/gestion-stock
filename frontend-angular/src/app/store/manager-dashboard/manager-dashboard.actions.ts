import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DashboardResponse } from '../../features/shop/types/shop.types';

export const ManagerDashboardActions = createActionGroup({
  source: 'Manager Dashboard',
  events: {
    'Load Dashboard': emptyProps(),
    'Load Dashboard Success': props<{ dashboard: DashboardResponse }>(),
    'Load Dashboard Failure': props<{ error: string }>(),
  }
});
