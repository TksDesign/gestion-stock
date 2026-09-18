import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CategoryService, ShopAdminService, ShopCustomerService, ShopManagerService } from './shop.service';

const BASE = `${environment.apiGatewayUrl}/api/v1/shops`;

describe('ShopAdminService', () => {
  let service: ShopAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ShopAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('createShop() POSTs to the base shops endpoint', () => {
    service.createShop({ name: 'Boutique Marie', managerId: 'm1', managerEmail: 'marie@kshop.com' }).subscribe();
    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('listAllShops() GETs the base shops endpoint', () => {
    service.listAllShops().subscribe();
    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('setStatus() PUTs the status as a query param with a null body', () => {
    service.setStatus(1, 'INACTIVE').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${BASE}/1/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.params.get('status')).toBe('INACTIVE');
    expect(req.request.body).toBeNull();
    req.flush({});
  });

  it('reassignManager() PUTs managerId and managerEmail as query params', () => {
    service.reassignManager(1, 'm2', 'sophie@kshop.com').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${BASE}/1/manager`);
    expect(req.request.params.get('managerId')).toBe('m2');
    expect(req.request.params.get('managerEmail')).toBe('sophie@kshop.com');
    req.flush({});
  });

  it('updateShop() PUTs the request body to /{id}', () => {
    service.updateShop(1, { name: 'Nouveau nom' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Nouveau nom' });
    req.flush({});
  });
});

describe('ShopManagerService', () => {
  let service: ShopManagerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ShopManagerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getStock() sends lowStockOnly as a query param', () => {
    service.getStock(true).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${BASE}/mine/stock`);
    expect(req.request.params.get('lowStockOnly')).toBe('true');
    req.flush([]);
  });

  it('adjustQuantity() PATCHes the delta payload', () => {
    service.adjustQuantity(5, { delta: -1 }).subscribe();
    const req = httpMock.expectOne(`${BASE}/mine/stock/5/quantity`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ delta: -1 });
    req.flush({});
  });

  it('deleteStockItem() DELETEs the item', () => {
    service.deleteStockItem(5).subscribe();
    const req = httpMock.expectOne(`${BASE}/mine/stock/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('createSale() POSTs to /mine/sales', () => {
    service.createSale({ items: [{ stockItemId: 1, quantity: 2 }] }).subscribe();
    const req = httpMock.expectOne(`${BASE}/mine/sales`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('updateSaleItemStatus() PATCHes the status of one line', () => {
    service.updateSaleItemStatus(10, 20, { status: 'SHIPPED' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/mine/sales/10/items/20/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'SHIPPED' });
    req.flush({});
  });

  it('getDashboard() GETs /mine/dashboard', () => {
    service.getDashboard().subscribe();
    const req = httpMock.expectOne(`${BASE}/mine/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});

describe('ShopCustomerService', () => {
  let service: ShopCustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ShopCustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getMyOrders() GETs the customer catalog orders endpoint', () => {
    service.getMyOrders().subscribe();
    const req = httpMock.expectOne(`${BASE}/catalog/orders/mine`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('findAll() GETs the public categories endpoint', () => {
    service.findAll().subscribe();
    const req = httpMock.expectOne(`${BASE}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
