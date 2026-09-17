import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ShopSettingsActions } from './shop-settings.actions';
import { ShopManagerService } from '../features/shop/api/shop.service';
import { ToastService } from '../core/services/toast.service';

@Injectable()
export class ShopSettingsEffects {
  private actions$ = inject(Actions);
  private shopService = inject(ShopManagerService);
  private toast = inject(ToastService);

  loadShop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShopSettingsActions.loadShop),
      mergeMap(() =>
        this.shopService.getMyShop().pipe(
          map(shop => ShopSettingsActions.loadShopSuccess({ shop })),
          catchError(error => of(ShopSettingsActions.loadShopFailure({ error: error.message })))
        )
      )
    );
  });

  updateShop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShopSettingsActions.updateShop),
      mergeMap(({ data }) =>
        this.shopService.updateMyShop(data).pipe(
          map(shop => {
            this.toast.success('Paramètres mis à jour !');
            return ShopSettingsActions.updateShopSuccess({ shop });
          }),
          catchError(error => {
            this.toast.error('Erreur lors de la mise à jour');
            return of(ShopSettingsActions.updateShopFailure({ error: error.message }));
          })
        )
      )
    );
  });
}
