import { FavoritesActions } from './favorites.actions';
import { favoritesReducer } from './favorites.reducer';

describe('favoritesReducer', () => {
  it('returns an empty favoriteIds array as the initial state', () => {
    const state = favoritesReducer(undefined, { type: '@@INIT' } as any);
    expect(state.favoriteIds).toEqual([]);
  });

  it('toggleFavorite adds an id that is not yet favorited', () => {
    const state = favoritesReducer({ favoriteIds: [] }, FavoritesActions.toggleFavorite({ id: 1 }));
    expect(state.favoriteIds).toEqual([1]);
  });

  it('toggleFavorite removes an id that is already favorited', () => {
    const state = favoritesReducer({ favoriteIds: [1, 2] }, FavoritesActions.toggleFavorite({ id: 1 }));
    expect(state.favoriteIds).toEqual([2]);
  });

  it('hydrate replaces favoriteIds with the persisted list', () => {
    const state = favoritesReducer({ favoriteIds: [1] }, FavoritesActions.hydrate({ favoriteIds: [5, 6] }));
    expect(state.favoriteIds).toEqual([5, 6]);
  });
});
