import { createReducer, on } from '@ngrx/store';
import { DashboardResponse } from '../../features/shop/types/shop.types';
import { ManagerDashboardActions } from './manager-dashboard.actions';

export interface ManagerDashboardState {
  dashboard: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ManagerDashboardState = {
  dashboard: null,
  isLoading: false,
  error: null,
};

export const managerDashboardReducer = createReducer(
  initialState,
  on(ManagerDashboardActions.loadDashboard, (state) => ({ ...state, isLoading: true, error: null })),
  on(ManagerDashboardActions.loadDashboardSuccess, (state, { dashboard }) => ({ ...state, dashboard, isLoading: false })),
  on(ManagerDashboardActions.loadDashboardFailure, (state, { error }) => ({ ...state, error, isLoading: false }))
);
