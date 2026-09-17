import { api } from '../../../lib/axios';
import { OrderLineResponse } from '../types';

const BASE_URL = '/api/v1/order-lines';

export const orderLineApi = {
  // Récupérer les lignes de commande pour une commande donnée
  findByOrderId: async (orderId: number): Promise<OrderLineResponse[]> => {
    const { data } = await api.get<OrderLineResponse[]>(`${BASE_URL}/order/${orderId}`);
    return data;
  }
};
