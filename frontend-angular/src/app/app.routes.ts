import { Routes } from '@angular/router';
import { protectedGuard } from './routes/protected.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [protectedGuard(['ADMIN'])],
    loadComponent: () =>
      import('./components/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'shops' },
      {
        path: 'shops',
        loadComponent: () => import('./pages/admin/admin-shops.component').then((m) => m.AdminShopsComponent),
      },
      {
        path: 'managers',
        loadComponent: () =>
          import('./pages/admin/admin-managers.component').then((m) => m.AdminManagersComponent),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/admin/admin-clients.component').then((m) => m.AdminClientsComponent),
      },
    ],
  },
  {
    path: 'manager',
    canActivate: [protectedGuard(['SHOP_MANAGER', 'ADMIN'])],
    loadComponent: () =>
      import('./components/layout/manager-layout.component').then((m) => m.ManagerLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/manager/manager-dashboard.component').then((m) => m.ManagerDashboardComponent),
      },
      {
        path: 'stock',
        loadComponent: () => import('./pages/manager/manager-stock.component').then((m) => m.ManagerStockComponent),
      },
      {
        path: 'sales',
        loadComponent: () => import('./pages/manager/manager-sales.component').then((m) => m.ManagerSalesComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/manager/manager-settings.component').then((m) => m.ManagerSettingsComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/home-layout.component').then((m) => m.HomeLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/shop-layout.component').then((m) => m.ShopLayoutComponent),
    children: [
      {
        path: 'products',
        loadComponent: () => import('./pages/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./pages/favorites.component').then((m) => m.FavoritesComponent),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/product-details.component').then((m) => m.ProductDetailsComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        canActivate: [protectedGuard()],
        loadComponent: () => import('./pages/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'success',
        canActivate: [protectedGuard()],
        loadComponent: () => import('./pages/order-success.component').then((m) => m.OrderSuccessComponent),
      },
      {
        path: 'profile',
        canActivate: [protectedGuard()],
        loadComponent: () => import('./pages/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
