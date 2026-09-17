import { api } from '../../../lib/axios';
import { Product, ProductPurchaseRequest, ProductPurchaseResponse } from '../types';

// Catalogue public de shop-service — remplace l'ancien product-service depuis le 2026-09-17
// (voir services/shop CatalogController). Les produits achetables appartiennent tous
// désormais à une boutique (shopId), y compris ceux migrés depuis l'ancien catalogue.
const BASE_URL = '/api/v1/shops/catalog/products';

export const productApi = {
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

  // Acheter des produits (décrémente le stock) — utilisé par order-service en interne ;
  // conservé côté frontend pour d'éventuels flows d'achat directs.
  purchase: async (requests: ProductPurchaseRequest[]): Promise<ProductPurchaseResponse[]> => {
    const { data } = await api.post<ProductPurchaseResponse[]>(`${BASE_URL}/purchase`, requests);
    return data;
  },

  // Restaurer le stock
  restore: async (requests: ProductPurchaseRequest[]): Promise<void> => {
    await api.post(`${BASE_URL}/restore`, requests);
  }
};
