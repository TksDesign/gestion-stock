import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ManagerDashboardActions } from './manager-dashboard.actions';
import { ShopManagerService } from '../../features/shop/api/shop.service';

@Injectable()
export class ManagerDashboardEffects {
  private actions$ = inject(Actions);
  private shopService = inject(ShopManagerService);

  loadDashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerDashboardActions.loadDashboard),
      mergeMap(() =>
        this.shopService.getDashboard().pipe(
          map(dashboard => ManagerDashboardActions.loadDashboardSuccess({ dashboard })),
          catchError(error => of(ManagerDashboardActions.loadDashboardFailure({ error: error.message })))
        )
      )
    );
  });
}
