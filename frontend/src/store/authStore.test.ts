import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './authStore';
import { queryClient } from '../lib/queryClient';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, user: null, token: null });
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('login sets isAuthenticated, user and token', () => {
    const user = { id: 'u1', firstname: 'Marie', lastname: 'Dupont', email: 'marie@kshop.com', role: 'SHOP_MANAGER' as const };
    useAuthStore.getState().login(user, 'jwt-token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('jwt-token');
  });

  it('login clears the React Query cache (prevents cross-account cache leakage)', () => {
    queryClient.setQueryData(['probe'], 'stale-data-from-previous-account');

    const user = { id: 'u1', firstname: 'Marie', lastname: 'Dupont', email: 'marie@kshop.com', role: 'SHOP_MANAGER' as const };
    useAuthStore.getState().login(user, 'jwt-token');

    expect(queryClient.getQueryData(['probe'])).toBeUndefined();
  });

  it('logout resets isAuthenticated, user and token', () => {
    const user = { id: 'u1', firstname: 'Marie', lastname: 'Dupont', email: 'marie@kshop.com', role: 'SHOP_MANAGER' as const };
    useAuthStore.getState().login(user, 'jwt-token');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('logout also clears the React Query cache', () => {
    queryClient.setQueryData(['probe'], 'some-data');

    useAuthStore.getState().logout();

    expect(queryClient.getQueryData(['probe'])).toBeUndefined();
  });
});
