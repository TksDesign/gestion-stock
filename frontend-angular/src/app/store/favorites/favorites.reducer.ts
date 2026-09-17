import { createReducer, on } from '@ngrx/store';
import { FavoritesActions } from './favorites.actions';
import { hydrateFeature } from '../persist.meta-reducer';
import { favoritesFeatureKey } from '../feature-keys';

export { favoritesFeatureKey };

export interface FavoritesState {
  favoriteIds: number[];
}

const initialState: FavoritesState = { favoriteIds: [] };

export const favoritesReducer = createReducer(
  hydrateFeature(favoritesFeatureKey, initialState),
  on(FavoritesActions.toggleFavorite, (state, { id }) => ({
    favoriteIds: state.favoriteIds.includes(id)
      ? state.favoriteIds.filter((fid) => fid !== id)
      : [...state.favoriteIds, id],
  })),
  on(FavoritesActions.hydrate, (_state, { favoriteIds }) => ({ favoriteIds })),
);
