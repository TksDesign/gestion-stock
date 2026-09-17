import { api } from '../../../lib/axios';
import { OrderRequest, OrderResponse } from '../types';

const BASE_URL = '/api/v1/orders';

export const orderApi = {
  // Créer une nouvelle commande
  create: async (order: OrderRequest): Promise<number> => {
    const { data } = await api.post<number>(BASE_URL, order);
    return data;
  },

  // Récupérer toutes les commandes
  findAll: async (): Promise<OrderResponse[]> => {
    const { data } = await api.get<OrderResponse[]>(BASE_URL);
    return data;
  },

  // Récupérer une commande par son ID
  findById: async (id: number): Promise<OrderResponse> => {
    const { data } = await api.get<OrderResponse>(`${BASE_URL}/${id}`);
    return data;
  }
};
