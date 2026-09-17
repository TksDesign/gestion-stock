import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Product, ProductPurchaseRequest, ProductPurchaseResponse } from '../types/product.types';

const BASE_URL = `${environment.apiGatewayUrl}/api/v1/shops/catalog/products`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<Product[]>(BASE_URL);
  }

  findById(id: number) {
    return this.http.get<Product>(`${BASE_URL}/${id}`);
  }

  purchase(requests: ProductPurchaseRequest[]) {
    return this.http.post<ProductPurchaseResponse[]>(`${BASE_URL}/purchase`, requests);
  }

  restore(requests: ProductPurchaseRequest[]) {
    return this.http.post<void>(`${BASE_URL}/restore`, requests);
  }
}
