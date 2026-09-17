import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { initialAuthState } from './auth.model';
import { hydrateFeature } from '../persist.meta-reducer';
import { authFeatureKey } from '../feature-keys';

export { authFeatureKey };

export const authReducer = createReducer(
  hydrateFeature(authFeatureKey, initialAuthState),
  on(AuthActions.login, AuthActions.hydrate, (state, { user, token }) => ({
    ...state,
    isAuthenticated: true,
    user,
    token,
  })),
  on(AuthActions.logout, () => initialAuthState),
);
