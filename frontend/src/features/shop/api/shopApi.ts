import { api } from '../../../lib/axios';
import type {
  ShopResponse, CreateShopRequest, ShopRequest,
  StockItemResponse, StockItemRequest, StockAdjustmentRequest,
  SaleResponse, SaleRequest,
  DashboardResponse,
} from '../types';

const BASE = '/api/v1/shops';

// ─── Admin ────────────────────────────────────────────────────
export const shopAdminApi = {
  createShop: (data: CreateShopRequest) =>
    api.post<ShopResponse>(BASE, data).then(r => r.data),

  listAllShops: () =>
    api.get<ShopResponse[]>(BASE).then(r => r.data),

  getShopById: (id: number) =>
    api.get<ShopResponse>(`${BASE}/${id}`).then(r => r.data),

  setStatus: (id: number, status: 'ACTIVE' | 'INACTIVE') =>
    api.put<ShopResponse>(`${BASE}/${id}/status`, null, { params: { status } }).then(r => r.data),

  reassignManager: (id: number, managerId: string, managerEmail: string) =>
    api.put<ShopResponse>(`${BASE}/${id}/manager`, null, { params: { managerId, managerEmail } }).then(r => r.data),
};

// ─── Gérante : sa boutique ────────────────────────────────────
export const shopManagerApi = {
  getMyShop: () =>
    api.get<ShopResponse>(`${BASE}/mine`).then(r => r.data),

  updateMyShop: (data: ShopRequest) =>
    api.put<ShopResponse>(`${BASE}/mine`, data).then(r => r.data),

  // Stock
  getStock: (lowStockOnly = false) =>
    api.get<StockItemResponse[]>(`${BASE}/mine/stock`, { params: { lowStockOnly } }).then(r => r.data),

  getStockItem: (itemId: number) =>
    api.get<StockItemResponse>(`${BASE}/mine/stock/${itemId}`).then(r => r.data),

  createStockItem: (data: StockItemRequest) =>
    api.post<StockItemResponse>(`${BASE}/mine/stock`, data).then(r => r.data),

  updateStockItem: (itemId: number, data: StockItemRequest) =>
    api.put<StockItemResponse>(`${BASE}/mine/stock/${itemId}`, data).then(r => r.data),

  adjustQuantity: (itemId: number, data: StockAdjustmentRequest) =>
    api.patch<StockItemResponse>(`${BASE}/mine/stock/${itemId}/quantity`, data).then(r => r.data),

  deleteStockItem: (itemId: number) =>
    api.delete(`${BASE}/mine/stock/${itemId}`),

  // Ventes
  getSales: () =>
    api.get<SaleResponse[]>(`${BASE}/mine/sales`).then(r => r.data),

  getSaleById: (saleId: number) =>
    api.get<SaleResponse>(`${BASE}/mine/sales/${saleId}`).then(r => r.data),

  createSale: (data: SaleRequest) =>
    api.post<SaleResponse>(`${BASE}/mine/sales`, data).then(r => r.data),

  // Dashboard
  getDashboard: () =>
    api.get<DashboardResponse>(`${BASE}/mine/dashboard`).then(r => r.data),
};
