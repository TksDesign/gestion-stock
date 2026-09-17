import { createActionGroup, props } from '@ngrx/store';

export const FavoritesActions = createActionGroup({
  source: 'Favorites',
  events: {
    'Toggle Favorite': props<{ id: number }>(),
    'Hydrate': props<{ favoriteIds: number[] }>(),
  },
});
