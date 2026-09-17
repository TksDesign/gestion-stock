import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectCurrentUser, selectIsAuthenticated } from '../store/auth/auth.selectors';
import { UserRole } from '../store/auth/auth.model';
import { AuthModalService } from '../core/services/auth-modal.service';

export function protectedGuard(allowedRoles?: UserRole[]): CanActivateFn {
  return () => {
    const store = inject(Store);
    const router = inject(Router);
    const authModal = inject(AuthModalService);

    return store.select(selectIsAuthenticated).pipe(
      take(1),
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          authModal.openModal('signin');
          return router.createUrlTree(['/cart']);
        }

        let user: any;
        store.select(selectCurrentUser).pipe(take(1)).subscribe((u) => (user = u));

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          return router.createUrlTree(['/']);
        }

        return true;
      }),
    );
  };
}
