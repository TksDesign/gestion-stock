import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { reducers } from './store/app.state';
import { metaReducers } from './store/persist.meta-reducer';
import { environment } from '../environments/environment';
import { ManagerDashboardEffects } from './store/manager-dashboard/manager-dashboard.effects';
import { ManagerStockEffects } from './store/manager-stock/manager-stock.effects';
import { ManagerSalesEffects } from './store/manager-sales/manager-sales.effects';
import { ShopSettingsEffects } from './store/shop-settings/shop-settings.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore(reducers, { metaReducers }),
    provideEffects([ManagerDashboardEffects, ManagerStockEffects, ManagerSalesEffects, ShopSettingsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
  ],
};
