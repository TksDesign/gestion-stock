import { api } from '../../../lib/axios';
import { Customer, CustomerRequest } from '../types';

const BASE_URL = '/api/v1/customers';

export const customerApi = {
  // Créer un nouveau client
  create: async (customer: CustomerRequest): Promise<string> => {
    const { data } = await api.post<string>(BASE_URL, customer);
    return data;
  },

  // Mettre à jour un client existant
  update: async (customer: CustomerRequest): Promise<void> => {
    await api.put(BASE_URL, customer);
  },

  // Récupérer tous les clients
  findAll: async (): Promise<Customer[]> => {
    const { data } = await api.get<Customer[]>(BASE_URL);
    return data;
  },

  // Récupérer un client par son ID
  findById: async (id: string): Promise<Customer> => {
    const { data } = await api.get<Customer>(`${BASE_URL}/${id}`);
    return data;
  },

  // Vérifier si un client existe
  existsById: async (id: string): Promise<boolean> => {
    const { data } = await api.get<boolean>(`${BASE_URL}/exists/${id}`);
    return data;
  },

  // Supprimer un client
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  }
};
