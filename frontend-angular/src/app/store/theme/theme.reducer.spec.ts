import { ThemeActions } from './theme.actions';
import { themeReducer } from './theme.reducer';

describe('themeReducer', () => {
  it('defaults to light theme', () => {
    const state = themeReducer(undefined, { type: '@@INIT' } as any);
    expect(state.theme).toBe('light');
  });

  it('toggleTheme switches from light to dark', () => {
    const state = themeReducer({ theme: 'light' }, ThemeActions.toggleTheme());
    expect(state.theme).toBe('dark');
  });

  it('toggleTheme switches from dark to light', () => {
    const state = themeReducer({ theme: 'dark' }, ThemeActions.toggleTheme());
    expect(state.theme).toBe('light');
  });

  it('setTheme sets an explicit theme', () => {
    const state = themeReducer({ theme: 'light' }, ThemeActions.setTheme({ theme: 'dark' }));
    expect(state.theme).toBe('dark');
  });

  it('hydrate sets the persisted theme', () => {
    const state = themeReducer({ theme: 'light' }, ThemeActions.hydrate({ theme: 'dark' }));
    expect(state.theme).toBe('dark');
  });
});
