import { QueryClient } from '@tanstack/react-query';

// Instance partagée : doit être importée (pas recréée) partout où le cache doit être
// vidé au changement de compte (voir authStore.login/logout) pour éviter qu'un
// compte affiche transitoirement des données mises en cache par le compte précédent
// (ex. commandes/ventes d'une autre gérante visibles juste après un changement de compte).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
