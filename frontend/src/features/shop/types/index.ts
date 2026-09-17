// ─── Shop ─────────────────────────────────────────────────────
export type ShopStatus = 'ACTIVE' | 'INACTIVE';

export interface ShopResponse {
  id: number;
  name: string;
  description?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  managerId: string;
  managerEmail?: string;
  status: ShopStatus;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateShopRequest {
  name: string;
  description?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  managerId: string;
  managerEmail?: string;
}

export interface ShopRequest {
  name: string;
  description?: string;
  street?: string;
  city?: string;
  zipCode?: string;
}

// ─── Stock ────────────────────────────────────────────────────
export interface StockItemResponse {
  id: number;
  shopId: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface StockItemRequest {
  name: string;
  description?: string;
  category?: string;
  price: number;
  quantity: number;
  lowStockThreshold?: number;
}

export interface StockAdjustmentRequest {
  delta: number;
  reason?: string;
}

// ─── Sales ────────────────────────────────────────────────────
export interface SaleItemResponse {
  stockItemId: number;
  stockItemName: string;
  unitPrice: number;
  quantity: number;
}

export interface SaleResponse {
  id: number;
  shopId: number;
  reference: string;
  totalAmount: number;
  items: SaleItemResponse[];
  createdDate: string;
}

export interface SaleLineRequest {
  stockItemId: number;
  quantity: number;
}

export interface SaleRequest {
  items: SaleLineRequest[];
}

// ─── Dashboard ────────────────────────────────────────────────
export interface TopSellingItem {
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardResponse {
  totalStockItems: number;
  lowStockItemsCount: number;
  totalStockValue: number;
  totalSalesCount: number;
  totalRevenue: number;
  topSellingItems: TopSellingItem[];
  lowStockItems: StockItemResponse[];
}
