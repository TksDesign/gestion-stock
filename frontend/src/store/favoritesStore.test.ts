import { beforeEach, describe, expect, it } from 'vitest';
import { useFavoritesStore } from './favoritesStore';

describe('useFavoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  it('starts with no favorites', () => {
    expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
  });

  it('toggleFavorite adds an id that is not yet favorited', () => {
    useFavoritesStore.getState().toggleFavorite(1);
    expect(useFavoritesStore.getState().favoriteIds).toEqual([1]);
  });

  it('toggleFavorite removes an id that is already favorited', () => {
    useFavoritesStore.setState({ favoriteIds: [1, 2] });
    useFavoritesStore.getState().toggleFavorite(1);
    expect(useFavoritesStore.getState().favoriteIds).toEqual([2]);
  });

  it('isFavorite reflects the current favoriteIds list', () => {
    useFavoritesStore.setState({ favoriteIds: [3] });
    expect(useFavoritesStore.getState().isFavorite(3)).toBe(true);
    expect(useFavoritesStore.getState().isFavorite(4)).toBe(false);
  });
});
