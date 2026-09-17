import { ActionReducer, MetaReducer } from '@ngrx/store';
import { authFeatureKey, cartFeatureKey, favoritesFeatureKey, themeFeatureKey } from './feature-keys';

// Mappe chaque feature persistée vers sa clé localStorage d'origine (React/Zustand)
// pour rester compatible avec les données déjà stockées côté navigateur.
const PERSISTED_KEYS: Record<string, string> = {
  [authFeatureKey]: 'auth-storage',
  [cartFeatureKey]: 'cart-storage',
  [favoritesFeatureKey]: 'kshop-favorites',
  [themeFeatureKey]: 'theme-storage',
};

export function hydrateFeature<T>(featureKey: string, fallback: T): T {
  const storageKey = PERSISTED_KEYS[featureKey];
  if (!storageKey) return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function persistMetaReducer(
  reducer: ActionReducer<Record<string, unknown>>,
): ActionReducer<Record<string, unknown>> {
  return (state, action) => {
    const nextState = reducer(state, action);
    for (const [featureKey, storageKey] of Object.entries(PERSISTED_KEYS)) {
      if (nextState[featureKey] !== undefined) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextState[featureKey]));
        } catch {
          // localStorage indisponible — on ignore
        }
      }
    }
    return nextState;
  };
}

export const metaReducers: MetaReducer<any>[] = [persistMetaReducer];
