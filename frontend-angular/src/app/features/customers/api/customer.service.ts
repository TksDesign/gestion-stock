import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Customer, CustomerRequest } from '../types/customer.types';

const BASE_URL = `${environment.apiGatewayUrl}/api/v1/customers`;

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  create(customer: CustomerRequest) {
    return this.http.post<string>(BASE_URL, customer);
  }

  update(customer: CustomerRequest) {
    return this.http.put<void>(BASE_URL, customer);
  }

  findAll() {
    return this.http.get<Customer[]>(BASE_URL);
  }

  findById(id: string) {
    return this.http.get<Customer>(`${BASE_URL}/${id}`);
  }

  existsById(id: string) {
    return this.http.get<boolean>(`${BASE_URL}/exists/${id}`);
  }

  delete(id: string) {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
