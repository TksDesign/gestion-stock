import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopManagerApi, shopAdminApi } from '../api/shopApi';
import type { ShopRequest, StockItemRequest, StockAdjustmentRequest, SaleRequest, CreateShopRequest } from '../types';

// ─── Query keys ───────────────────────────────────────────────
export const shopKeys = {
  myShop: ['shop', 'mine'] as const,
  allShops: ['shops', 'all'] as const,
  stock: (lowStockOnly = false) => ['shop', 'stock', lowStockOnly] as const,
  stockItem: (id: number) => ['shop', 'stock', id] as const,
  sales: ['shop', 'sales'] as const,
  sale: (id: number) => ['shop', 'sales', id] as const,
  dashboard: ['shop', 'dashboard'] as const,
};

// ─── Gérante ──────────────────────────────────────────────────
export const useMyShop = () =>
  useQuery({ queryKey: shopKeys.myShop, queryFn: shopManagerApi.getMyShop });

export const useUpdateMyShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ShopRequest) => shopManagerApi.updateMyShop(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.myShop }),
  });
};

// ─── Stock ────────────────────────────────────────────────────
export const useStock = (lowStockOnly = false) =>
  useQuery({ queryKey: shopKeys.stock(lowStockOnly), queryFn: () => shopManagerApi.getStock(lowStockOnly) });

export const useCreateStockItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StockItemRequest) => shopManagerApi.createStockItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.stock() }),
  });
};

export const useUpdateStockItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockItemRequest }) => shopManagerApi.updateStockItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.stock() }),
  });
};

export const useAdjustQuantity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockAdjustmentRequest }) => shopManagerApi.adjustQuantity(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.stock() });
      qc.invalidateQueries({ queryKey: shopKeys.dashboard });
    },
  });
};

export const useDeleteStockItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shopManagerApi.deleteStockItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.stock() });
      qc.invalidateQueries({ queryKey: shopKeys.dashboard });
    },
  });
};

// ─── Ventes ───────────────────────────────────────────────────
export const useSales = () =>
  useQuery({ queryKey: shopKeys.sales, queryFn: shopManagerApi.getSales });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaleRequest) => shopManagerApi.createSale(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.sales });
      qc.invalidateQueries({ queryKey: shopKeys.stock() });
      qc.invalidateQueries({ queryKey: shopKeys.dashboard });
    },
  });
};

// ─── Dashboard ────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({ queryKey: shopKeys.dashboard, queryFn: shopManagerApi.getDashboard });

// ─── Admin ────────────────────────────────────────────────────
export const useAllShops = () =>
  useQuery({ queryKey: shopKeys.allShops, queryFn: shopAdminApi.listAllShops });

export const useCreateShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShopRequest) => shopAdminApi.createShop(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.allShops }),
  });
};

export const useUpdateShopStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'INACTIVE' }) => shopAdminApi.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.allShops }),
  });
};
