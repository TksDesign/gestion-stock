import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id: number) => {
        set((state) => {
          if (state.favoriteIds.includes(id)) {
            return { favoriteIds: state.favoriteIds.filter(fid => fid !== id) };
          } else {
            return { favoriteIds: [...state.favoriteIds, id] };
          }
        });
      },
      isFavorite: (id: number) => get().favoriteIds.includes(id),
    }),
    {
      name: 'kshop-favorites', // key for localStorage
    }
  )
);
