import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectTheme } from '../../store/theme/theme.selectors';
import { ThemeActions } from '../../store/theme/theme.actions';
import { AuthActions } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, NgTemplateOutlet],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private readonly store = inject(Store);

  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly theme = this.store.selectSignal(selectTheme);
  readonly isMobileNavOpen = signal(false);

  readonly icons = { Menu, X };

  readonly links = [
    { to: '/admin/shops', label: 'Boutiques', icon: '🏪' },
    { to: '/admin/managers', label: 'Gérantes', icon: '👤' },
    { to: '/admin/clients', label: 'Clients', icon: '🛍️' },
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
