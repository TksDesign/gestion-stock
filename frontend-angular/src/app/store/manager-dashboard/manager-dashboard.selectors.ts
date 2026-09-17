import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ManagerDashboardState } from './manager-dashboard.reducer';

export const selectManagerDashboardState = createFeatureSelector<ManagerDashboardState>('managerDashboard');

export const selectDashboardData = createSelector(selectManagerDashboardState, (state) => state.dashboard);
export const selectDashboardLoading = createSelector(selectManagerDashboardState, (state) => state.isLoading);
export const selectDashboardError = createSelector(selectManagerDashboardState, (state) => state.error);
