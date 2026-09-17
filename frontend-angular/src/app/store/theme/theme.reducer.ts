import { createReducer, on } from '@ngrx/store';
import { ThemeActions, Theme } from './theme.actions';
import { hydrateFeature } from '../persist.meta-reducer';
import { themeFeatureKey } from '../feature-keys';

export { themeFeatureKey };

export interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = { theme: 'light' };

export const themeReducer = createReducer(
  hydrateFeature(themeFeatureKey, initialState),
  on(ThemeActions.toggleTheme, (state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' } as ThemeState)),
  on(ThemeActions.setTheme, ThemeActions.hydrate, (_state, { theme }) => ({ theme })),
);
