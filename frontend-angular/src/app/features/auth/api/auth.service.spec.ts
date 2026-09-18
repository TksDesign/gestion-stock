import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthResponse, AuthService, UserSummary } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const BASE_URL = `${environment.apiGatewayUrl}/api/v1/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login() POSTs credentials to /login and returns the response', () => {
    const mockResponse: AuthResponse = {
      token: 'jwt', userId: 'u1', customerId: null, firstname: 'Paul', lastname: 'Client',
      email: 'paul@kshop.com', role: 'CLIENT',
    };
    let result: AuthResponse | undefined;

    service.login({ email: 'paul@kshop.com', password: 'secret' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE_URL}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'paul@kshop.com', password: 'secret' });
    req.flush(mockResponse);

    expect(result).toEqual(mockResponse);
  });

  it('register() POSTs to /register', () => {
    service.register({ firstname: 'Paul', lastname: 'Client', email: 'paul@kshop.com', password: 'secret' })
      .subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/register`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('createShopManager() POSTs to /admin/managers', () => {
    service.createShopManager({ firstname: 'Sophie', lastname: 'Gerante', email: 'sophie@kshop.com', password: 'secret' })
      .subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/admin/managers`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('me() GETs /me', () => {
    service.me().subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/me`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('findUsers() without a role omits the role query param', () => {
    service.findUsers().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/admin/users`);
    expect(req.request.params.has('role')).toBe(false);
    req.flush([]);
  });

  it('findUsers(role) sends the role as a query param', () => {
    const mockUsers: UserSummary[] = [
      { id: 'u1', firstname: 'Marie', lastname: 'Dupont', email: 'marie@kshop.com', role: 'SHOP_MANAGER', customerId: null },
    ];
    let result: UserSummary[] | undefined;

    service.findUsers('SHOP_MANAGER').subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/admin/users`);
    expect(req.request.params.get('role')).toBe('SHOP_MANAGER');
    req.flush(mockUsers);

    expect(result).toEqual(mockUsers);
  });
});
