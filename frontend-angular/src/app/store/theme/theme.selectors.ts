import { createFeatureSelector, createSelector } from '@ngrx/store';
import { themeFeatureKey, ThemeState } from './theme.reducer';

export const selectThemeState = createFeatureSelector<ThemeState>(themeFeatureKey);
export const selectTheme = createSelector(selectThemeState, (s) => s.theme);
