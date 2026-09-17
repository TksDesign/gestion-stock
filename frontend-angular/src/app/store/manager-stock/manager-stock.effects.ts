import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ManagerStockActions } from './manager-stock.actions';
import { ShopManagerService, CategoryService } from '../features/shop/api/shop.service';
import { ToastService } from '../core/services/toast.service';

@Injectable()
export class ManagerStockEffects {
  private actions$ = inject(Actions);
  private shopService = inject(ShopManagerService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  loadStock$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerStockActions.loadStock),
      mergeMap(() =>
        this.shopService.getStock().pipe(
          map(items => ManagerStockActions.loadStockSuccess({ items })),
          catchError(error => of(ManagerStockActions.loadStockFailure({ error: error.message })))
        )
      )
    );
  });

  loadCategories$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerStockActions.loadCategories),
      mergeMap(() =>
        this.categoryService.findAll().pipe(
          map(categories => ManagerStockActions.loadCategoriesSuccess({ categories })),
          catchError(error => of(ManagerStockActions.loadCategoriesFailure({ error: error.message })))
        )
      )
    );
  });

  createItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerStockActions.createItem),
      mergeMap(({ data }) =>
        this.shopService.createStockItem(data).pipe(
          map(item => {
            this.toast.success('Article ajouté au stock !');
            return ManagerStockActions.createItemSuccess({ item });
          }),
          catchError(error => {
            this.toast.error("Erreur lors de l'ajout");
            return of(ManagerStockActions.createItemFailure({ error: error.message }));
          })
        )
      )
    );
  });

  updateItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerStockActions.updateItem),
      mergeMap(({ id, data }) =>
        this.shopService.updateStockItem(id, data).pipe(
          map(item => {
            this.toast.success('Produit mis à jour !');
            return ManagerStockActions.updateItemSuccess({ item });
          }),
          catchError(error => {
            this.toast.error('Erreur lors de la mise à jour');
            return of(ManagerStockActions.updateItemFailure({ error: error.message }));
          })
        )
      )
    );
  });

  adjustQuantity$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerStockActions.adjustQuantity),
      mergeMap(({ id, data }) =>
        this.shopService.adjustQuantity(id, data).pipe(
          map(item => ManagerStockActions.adjustQuantitySuccess({ item })),
          catchError(error => of(ManagerStockActions.adjustQuantityFailure({ error: error.message })))
        )
      )
    );
  });

  deleteItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ManagerStockActions.deleteItem),
      mergeMap(({ id }) =>
        this.shopService.deleteStockItem(id).pipe(
          map(() => {
            this.toast.success('Article supprimé.');
            return ManagerStockActions.deleteItemSuccess({ id });
          }),
          catchError(error => {
            this.toast.error('Erreur lors de la suppression');
            return of(ManagerStockActions.deleteItemFailure({ error: error.message }));
          })
        )
      )
    );
  });
}
