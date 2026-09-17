import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { ProductPurchaseRequest } from '../types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: productApi.findAll,
  });
};

export const useProduct = (id: number | undefined) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.findById(id!),
    enabled: !!id,
  });
};

export const usePurchaseProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requests: ProductPurchaseRequest[]) => productApi.purchase(requests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // On ne met pas de toast de succès ici car souvent l'achat fait partie de la création de commande
    },
  });
};
