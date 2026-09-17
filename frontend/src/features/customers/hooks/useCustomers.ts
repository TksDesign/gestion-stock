import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customerApi';
import { CustomerRequest } from '../types';
import toast from 'react-hot-toast';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.findAll,
  });
};

export const useCustomer = (id: string | undefined) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerApi.findById(id!),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CustomerRequest) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Client créé avec succès !');
    },
    onError: () => {
      // Les erreurs générales sont gérées par l'intercepteur Axios
    }
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CustomerRequest) => customerApi.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
      toast.success('Client mis à jour avec succès !');
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Client supprimé avec succès !');
    },
  });
};
