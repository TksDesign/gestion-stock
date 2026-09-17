import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { OrderLineResponse, OrderRequest, OrderResponse } from '../types/order.types';

const BASE_URL = `${environment.apiGatewayUrl}/api/v1/orders`;
const ORDER_LINES_URL = `${environment.apiGatewayUrl}/api/v1/order-lines`;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  create(order: OrderRequest) {
    return this.http.post<number>(BASE_URL, order);
  }

  findAll() {
    return this.http.get<OrderResponse[]>(BASE_URL);
  }

  findById(id: number) {
    return this.http.get<OrderResponse>(`${BASE_URL}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class OrderLineService {
  private readonly http = inject(HttpClient);

  findByOrderId(orderId: number) {
    return this.http.get<OrderLineResponse[]>(`${ORDER_LINES_URL}/order/${orderId}`);
  }
}
