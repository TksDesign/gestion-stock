import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  CategoryResponse,
  CreateShopRequest,
  DashboardResponse,
  SaleItemResponse,
  SaleItemStatusUpdateRequest,
  SaleRequest,
  SaleResponse,
  ShopRequest,
  ShopResponse,
  StockAdjustmentRequest,
  StockItemRequest,
  StockItemResponse,
} from '../types/shop.types';

const BASE = `${environment.apiGatewayUrl}/api/v1/shops`;

@Injectable({ providedIn: 'root' })
export class ShopAdminService {
  private readonly http = inject(HttpClient);

  createShop(data: CreateShopRequest) {
    return this.http.post<ShopResponse>(BASE, data);
  }

  listAllShops() {
    return this.http.get<ShopResponse[]>(BASE);
  }

  getShopById(id: number) {
    return this.http.get<ShopResponse>(`${BASE}/${id}`);
  }

  setStatus(id: number, status: 'ACTIVE' | 'INACTIVE') {
    return this.http.put<ShopResponse>(`${BASE}/${id}/status`, null, {
      params: new HttpParams().set('status', status),
    });
  }

  reassignManager(id: number, managerId: string, managerEmail: string) {
    return this.http.put<ShopResponse>(`${BASE}/${id}/manager`, null, {
      params: new HttpParams().set('managerId', managerId).set('managerEmail', managerEmail),
    });
  }

  updateShop(id: number, data: ShopRequest) {
    return this.http.put<ShopResponse>(`${BASE}/${id}`, data);
  }
}

@Injectable({ providedIn: 'root' })
export class ShopManagerService {
  private readonly http = inject(HttpClient);

  getMyShop() {
    return this.http.get<ShopResponse>(`${BASE}/mine`);
  }

  updateMyShop(data: ShopRequest) {
    return this.http.put<ShopResponse>(`${BASE}/mine`, data);
  }

  getStock(lowStockOnly = false) {
    return this.http.get<StockItemResponse[]>(`${BASE}/mine/stock`, {
      params: new HttpParams().set('lowStockOnly', lowStockOnly),
    });
  }

  getStockItem(itemId: number) {
    return this.http.get<StockItemResponse>(`${BASE}/mine/stock/${itemId}`);
  }

  createStockItem(data: StockItemRequest) {
    return this.http.post<StockItemResponse>(`${BASE}/mine/stock`, data);
  }

  updateStockItem(itemId: number, data: StockItemRequest) {
    return this.http.put<StockItemResponse>(`${BASE}/mine/stock/${itemId}`, data);
  }

  adjustQuantity(itemId: number, data: StockAdjustmentRequest) {
    return this.http.patch<StockItemResponse>(`${BASE}/mine/stock/${itemId}/quantity`, data);
  }

  deleteStockItem(itemId: number) {
    return this.http.delete(`${BASE}/mine/stock/${itemId}`);
  }

  getSales() {
    return this.http.get<SaleResponse[]>(`${BASE}/mine/sales`);
  }

  getSaleById(saleId: number) {
    return this.http.get<SaleResponse>(`${BASE}/mine/sales/${saleId}`);
  }

  createSale(data: SaleRequest) {
    return this.http.post<SaleResponse>(`${BASE}/mine/sales`, data);
  }

  updateSaleItemStatus(saleId: number, itemId: number, data: SaleItemStatusUpdateRequest) {
    return this.http.patch<SaleItemResponse>(`${BASE}/mine/sales/${saleId}/items/${itemId}/status`, data);
  }

  getDashboard() {
    return this.http.get<DashboardResponse>(`${BASE}/mine/dashboard`);
  }
}

@Injectable({ providedIn: 'root' })
export class ShopCustomerService {
  private readonly http = inject(HttpClient);

  getMyOrders() {
    return this.http.get<SaleResponse[]>(`${BASE}/catalog/orders/mine`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<CategoryResponse[]>(`${BASE}/categories`);
  }
}
