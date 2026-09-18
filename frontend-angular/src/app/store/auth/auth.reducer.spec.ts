import { AuthActions } from './auth.actions';
import { authReducer } from './auth.reducer';
import { AuthUser, initialAuthState } from './auth.model';

describe('authReducer', () => {
  const user: AuthUser = {
    id: 'u1',
    firstname: 'Marie',
    lastname: 'Dupont',
    email: 'marie@kshop.com',
    role: 'SHOP_MANAGER',
    customerId: null,
  };

  it('defaults to an unauthenticated state', () => {
    const state = authReducer(undefined, { type: '@@INIT' } as any);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('login sets isAuthenticated, user and token', () => {
    const state = authReducer(initialAuthState, AuthActions.login({ user, token: 'jwt-token' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('jwt-token');
  });

  it('hydrate behaves like login (same reducer branch)', () => {
    const state = authReducer(initialAuthState, AuthActions.hydrate({ user, token: 'jwt-token' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
  });

  it('logout resets to the initial (unauthenticated) state', () => {
    const loggedIn = { isAuthenticated: true, user, token: 'jwt-token' };
    const state = authReducer(loggedIn, AuthActions.logout());
    expect(state).toEqual(initialAuthState);
  });
});
