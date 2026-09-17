import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../components/ui/button.component';
import { ShopCustomerService } from '../features/shop/api/shop.service';
import { SaleItemStatus, SaleResponse } from '../features/shop/types/shop.types';
import { groupSalesByOrder, GroupedOrder } from '../features/shop/utils/group-orders';
import { selectCurrentUser } from '../store/auth/auth.selectors';
import { AuthActions } from '../store/auth/auth.actions';

const STATUS_LABELS: Record<SaleItemStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  EXPIRED: 'Expirée',
};

const STATUS_STYLES: Record<SaleItemStatus, string> = {
  PENDING: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10',
  CONFIRMED: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  PREPARING: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
  SHIPPED: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  DELIVERED: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
  CANCELLED: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
  EXPIRED: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ButtonComponent, DatePipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly shopCustomerService = inject(ShopCustomerService);
  private readonly store = inject(Store);

  readonly activeTab = signal<'orders' | 'details'>('orders');
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly sales = signal<SaleResponse[] | null>(null);
  readonly isOrdersLoading = signal(true);

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly STATUS_STYLES = STATUS_STYLES;

  readonly orders = computed<GroupedOrder[]>(() => (this.sales() ? groupSalesByOrder(this.sales()!) : []));

  ngOnInit() {
    this.shopCustomerService.getMyOrders().subscribe({
      next: (data) => {
        this.sales.set(data);
        this.isOrdersLoading.set(false);
      },
      error: () => this.isOrdersLoading.set(false),
    });
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  statusLabel(status: SaleItemStatus): string {
    return STATUS_LABELS[status];
  }

  statusStyle(status: SaleItemStatus): string {
    return STATUS_STYLES[status];
  }
}
