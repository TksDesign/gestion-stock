import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthModalStore } from './authModalStore';

describe('useAuthModalStore', () => {
  beforeEach(() => {
    useAuthModalStore.setState({ isOpen: false, view: 'signin' });
  });

  it('starts closed on the signin view', () => {
    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.view).toBe('signin');
  });

  it('openModal() with no argument opens on signin', () => {
    useAuthModalStore.getState().openModal();
    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.view).toBe('signin');
  });

  it('openModal(view) opens on the requested view', () => {
    useAuthModalStore.getState().openModal('signup');
    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.view).toBe('signup');
  });

  it('closeModal() closes without changing the view', () => {
    useAuthModalStore.getState().openModal('forgot');
    useAuthModalStore.getState().closeModal();
    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.view).toBe('forgot');
  });

  it('setView() changes the view without affecting isOpen', () => {
    useAuthModalStore.getState().setView('verify');
    const state = useAuthModalStore.getState();
    expect(state.view).toBe('verify');
    expect(state.isOpen).toBe(false);
  });
});
