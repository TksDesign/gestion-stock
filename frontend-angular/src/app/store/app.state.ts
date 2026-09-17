import { ActionReducerMap } from '@ngrx/store';
import { AuthState } from './auth/auth.model';
import { authFeatureKey, authReducer } from './auth/auth.reducer';
import { CartState } from './cart/cart.model';
import { cartFeatureKey, cartReducer } from './cart/cart.reducer';
import { FavoritesState, favoritesFeatureKey, favoritesReducer } from './favorites/favorites.reducer';
import { ThemeState, themeFeatureKey, themeReducer } from './theme/theme.reducer';
import { ManagerDashboardState, managerDashboardReducer } from './manager-dashboard/manager-dashboard.reducer';
import { ManagerStockState, managerStockReducer } from './manager-stock/manager-stock.reducer';

export interface AppState {
  [authFeatureKey]: AuthState;
  [cartFeatureKey]: CartState;
  [favoritesFeatureKey]: FavoritesState;
  [themeFeatureKey]: ThemeState;
  managerDashboard: ManagerDashboardState;
  managerStock: ManagerStockState;
}

export const reducers: ActionReducerMap<AppState> = {
  [authFeatureKey]: authReducer,
  [cartFeatureKey]: cartReducer,
  [favoritesFeatureKey]: favoritesReducer,
  [themeFeatureKey]: themeReducer,
  managerDashboard: managerDashboardReducer,
  managerStock: managerStockReducer,
};
