import { api } from '../../../lib/axios';
import { Product, ProductRequest, ProductPurchaseRequest, ProductPurchaseResponse } from '../types';

const BASE_URL = '/api/v1/products';

export const productApi = {
  // Créer un nouveau produit
  create: async (product: ProductRequest): Promise<number> => {
    const { data } = await api.post<number>(BASE_URL, product);
    return data;
  },

  // Récupérer tous les produits
  findAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>(BASE_URL);
    return data;
  },

  // Récupérer un produit par son ID
  findById: async (id: number): Promise<Product> => {
    const { data } = await api.get<Product>(`${BASE_URL}/${id}`);
    return data;
  },

  // Acheter des produits (décrémente le stock)
  purchase: async (requests: ProductPurchaseRequest[]): Promise<ProductPurchaseResponse[]> => {
    const { data } = await api.post<ProductPurchaseResponse[]>(`${BASE_URL}/purchase`, requests);
    return data;
  },
  
  // Restaurer le stock
  restore: async (requests: ProductPurchaseRequest[]): Promise<void> => {
    await api.post(`${BASE_URL}/restore`, requests);
  }
};
