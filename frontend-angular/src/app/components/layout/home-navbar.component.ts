import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Moon, Sun, User, Menu, X, ChevronDown, Heart, ShoppingCart } from 'lucide-angular';
import { ButtonComponent } from '../ui/button.component';
import { selectTheme } from '../../store/theme/theme.selectors';
import { ThemeActions } from '../../store/theme/theme.actions';
import { CartActions } from '../../store/cart/cart.actions';
import { selectCartCount } from '../../store/cart/cart.selectors';
import { selectFavoriteIds } from '../../store/favorites/favorites.selectors';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { AuthModalService } from '../../core/services/auth-modal.service';

@Component({
  selector: 'app-home-navbar',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
  templateUrl: './home-navbar.component.html',
})
export class HomeNavbarComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);

  readonly icons = { Moon, Sun, User, Menu, X, ChevronDown, Heart, ShoppingCart };

  readonly theme = this.store.selectSignal(selectTheme);
  readonly cartCount = this.store.selectSignal(selectCartCount);
  readonly favCount = computed(() => this.favoriteIds().length);
  readonly favoriteIds = this.store.selectSignal(selectFavoriteIds);
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  readonly user = this.store.selectSignal(selectCurrentUser);

  readonly isScrolled = signal(false);
  readonly isMobileOpen = signal(false);
  readonly bumpCart = signal(false);

  private lastCartCount = 0;

  constructor() {
    effect(() => {
      const count = this.cartCount();
      if (count > 0 && count !== this.lastCartCount) {
        this.bumpCart.set(true);
        setTimeout(() => this.bumpCart.set(false), 300);
      }
      this.lastCartCount = count;
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  get currentPath(): string {
    return this.router.url.split('?')[0];
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  toggleTheme() {
    this.store.dispatch(ThemeActions.toggleTheme());
  }

  openCart() {
    this.store.dispatch(CartActions.openCart());
  }

  openSignup() {
    this.authModal.openModal('signup');
  }

  openSignin() {
    this.authModal.openModal('signin');
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
    this.isMobileOpen.set(false);
  }
}
