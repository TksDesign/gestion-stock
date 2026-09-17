import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthUser } from './auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ user: AuthUser; token: string }>(),
    'Logout': emptyProps(),
    'Hydrate': props<{ user: AuthUser; token: string }>(),
  },
});
