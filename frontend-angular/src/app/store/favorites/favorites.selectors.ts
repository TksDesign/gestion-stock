import { createFeatureSelector, createSelector } from '@ngrx/store';
import { favoritesFeatureKey, FavoritesState } from './favorites.reducer';

export const selectFavoritesState = createFeatureSelector<FavoritesState>(favoritesFeatureKey);
export const selectFavoriteIds = createSelector(selectFavoritesState, (s) => s.favoriteIds);
export const selectIsFavorite = (id: number) =>
  createSelector(selectFavoriteIds, (ids) => ids.includes(id));
