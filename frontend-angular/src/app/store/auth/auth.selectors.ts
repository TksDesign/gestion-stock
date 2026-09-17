import { createFeatureSelector, createSelector } from '@ngrx/store';
import { authFeatureKey } from './auth.reducer';
import { AuthState } from './auth.model';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectIsAuthenticated = createSelector(selectAuthState, (s) => s.isAuthenticated);
export const selectCurrentUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthToken = createSelector(selectAuthState, (s) => s.token);
export const selectUserRole = createSelector(selectAuthState, (s) => s.user?.role ?? null);
