import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { AuthActions } from '../../store/auth/auth.actions';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status) {
        switch (error.status) {
          case 400:
            toast.error('Données invalides. Veuillez vérifier votre saisie.');
            break;
          case 401:
            toast.error('Votre session a expiré. Veuillez vous reconnecter.');
            store.dispatch(AuthActions.logout());
            break;
          case 403:
            toast.error("Vous n'avez pas l'autorisation d'effectuer cette action.");
            break;
          case 404:
            toast.error('La ressource demandée est introuvable.');
            break;
          case 500:
            toast.error('Erreur serveur. Veuillez réessayer plus tard.');
            break;
          default:
            toast.error('Une erreur inattendue est survenue.');
        }
      } else {
        toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      }
      return throwError(() => error);
    }),
  );
};
