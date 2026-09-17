import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ManagerSalesActions } from './manager-sales.actions';
import { ShopManagerService } from '../../features/shop/api/shop.service';
import { ToastService } from '../../core/services/toast.service';

@Injectable()
export class ManagerSalesEffects {
  private actions$ = inject(Actions);
  private shopService = inject(ShopManagerService);
  private toast = inject(ToastService);

  loadStock$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerSalesActions.loadStock),
      mergeMap(() =>
        this.shopService.getStock().pipe(
          map(items => ManagerSalesActions.loadStockSuccess({ items })),
          catchError(error => of(ManagerSalesActions.loadStockFailure({ error: error.message })))
        )
      )
    );
  });

  loadSales$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerSalesActions.loadSales),
      mergeMap(() =>
        this.shopService.getSales().pipe(
          map(sales => ManagerSalesActions.loadSalesSuccess({ sales })),
          catchError(error => of(ManagerSalesActions.loadSalesFailure({ error: error.message })))
        )
      )
    );
  });

  createSale$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerSalesActions.createSale),
      mergeMap(({ data }) =>
        this.shopService.createSale(data).pipe(
          map(sale => {
            this.toast.success('Vente enregistrée avec succès !');
            return ManagerSalesActions.createSaleSuccess({ sale });
          }),
          catchError(error => {
            this.toast.error("Erreur lors de l'encaissement");
            return of(ManagerSalesActions.createSaleFailure({ error: error.message }));
          })
        )
      )
    );
  });
  
  refreshStockAfterSale$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerSalesActions.createSaleSuccess),
      map(() => ManagerSalesActions.loadStock())
    );
  });
}
