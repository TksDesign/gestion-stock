import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { orderLineApi } from '../api/orderLineApi';
import { OrderRequest } from '../types';
import toast from 'react-hot-toast';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.findAll,
  });
};

export const useOrder = (id: number | undefined) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApi.findById(id!),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: OrderRequest) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande créée avec succès !');
    },
  });
};

export const useOrderLines = (orderId: number | undefined) => {
  return useQuery({
    queryKey: ['order-lines', orderId],
    queryFn: () => orderLineApi.findByOrderId(orderId!),
    enabled: !!orderId,
  });
};
