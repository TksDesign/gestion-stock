import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideAngularModule, LayoutDashboard, Package, CreditCard, Store as StoreIcon, Moon, Sun, LogOut, Hexagon, Menu, X } from 'lucide-angular';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectTheme } from '../../store/theme/theme.selectors';
import { ThemeActions } from '../../store/theme/theme.actions';
import { AuthActions } from '../../store/auth/auth.actions';

interface NavLink {
  to: string;
  label: string;
  icon: any;
}

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, NgTemplateOutlet],
  templateUrl: './manager-layout.component.html',
})
export class ManagerLayoutComponent {
  private readonly store = inject(Store);

  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly theme = this.store.selectSignal(selectTheme);
  readonly isMobileNavOpen = signal(false);

  readonly initials = computed(() => {
    const u = this.user();
    return u ? `${u.firstname?.[0] ?? ''}${u.lastname?.[0] ?? ''}` : '';
  });

  readonly icons = { LayoutDashboard, Package, CreditCard, StoreIcon, Moon, Sun, LogOut, Hexagon, Menu, X };

  readonly links: NavLink[] = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/stock', label: 'Stock Management', icon: Package },
    { to: '/manager/sales', label: 'Sales & POS', icon: CreditCard },
    { to: '/manager/settings', label: 'Store Settings', icon: StoreIcon },
  ];

  toggleTheme() {
    this.store.dispatch(ThemeActions.toggleTheme());
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  openNav() {
    this.isMobileNavOpen.set(true);
  }

  closeNav() {
    this.isMobileNavOpen.set(false);
  }
}
