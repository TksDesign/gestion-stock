import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Package, User, Search, ChevronDown, Calendar, Users2, X } from 'lucide-angular';
import { ShopManagerService } from '../../features/shop/api/shop.service';
import { SaleItemStatus, SaleResponse } from '../../features/shop/types/shop.types';
import {
  GroupedOrder,
  filterSales,
  groupByDay,
  groupSalesByCustomer,
  paginate,
} from '../../features/shop/utils/group-orders';
import { ToastService } from '../../core/services/toast.service';
import { PaginationComponent } from '../../components/ui/pagination.component';

const STATUS_OPTIONS: SaleItemStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'EXPIRED'];

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
  PENDING: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:border-white/10',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
  PREPARING: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800',
  SHIPPED: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800',
  EXPIRED: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800',
};

const PAGE_SIZE = 5;

type ViewMode = 'day' | 'customer';

@Component({
  selector: 'app-customer-orders-panel',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, PaginationComponent, DatePipe, NgTemplateOutlet],
  templateUrl: './customer-orders-panel.component.html',
})
export class CustomerOrdersPanelComponent implements OnInit {
  private readonly shopManagerService = inject(ShopManagerService);
  private readonly toast = inject(ToastService);

  readonly icons = { Package, User, Search, ChevronDown, Calendar, Users2, X };
  readonly STATUS_OPTIONS = STATUS_OPTIONS;
  readonly STATUS_LABELS = STATUS_LABELS;
  readonly STATUS_STYLES = STATUS_STYLES;

  readonly sales = signal<SaleResponse[]>([]);
  readonly isLoading = signal(true);
  readonly isUpdatingStatus = signal(false);

  readonly viewMode = signal<ViewMode>('day');
  readonly searchQuery = signal('');
  readonly statusFilter = signal<SaleItemStatus | 'ALL'>('ALL');
  readonly page = signal(1);
  readonly expandedCustomers = signal<Set<string>>(new Set());

  readonly onlineSales = computed(() => this.sales().filter((s) => s.source === 'ONLINE'));
  readonly filteredSales = computed(() => filterSales(this.onlineSales(), this.searchQuery(), this.statusFilter()));

  readonly dayGroups = computed(() => groupByDay(this.filteredSales()));
  readonly customerGroups = computed(() => groupSalesByCustomer(this.filteredSales()));

  readonly totalTopLevel = computed(() =>
    this.viewMode() === 'day' ? this.dayGroups().length : this.customerGroups().length,
  );
  readonly pagedDayGroups = computed(() => paginate(this.dayGroups(), this.page(), PAGE_SIZE));
  readonly pagedCustomerGroups = computed(() => paginate(this.customerGroups(), this.page(), PAGE_SIZE));

  ngOnInit() {
    this.load();
  }

  private load() {
    this.shopManagerService.getSales().subscribe({
      next: (data) => {
        this.sales.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  changeStatus(saleId: number, itemId: number, status: SaleItemStatus) {
    this.isUpdatingStatus.set(true);
    this.shopManagerService.updateSaleItemStatus(saleId, itemId, { status }).subscribe({
      next: (updatedItem) => {
        this.sales.update((list) =>
          list.map((s) =>
            s.id === saleId
              ? { ...s, items: s.items.map((i) => (i.id === itemId ? updatedItem : i)) }
              : s,
          ),
        );
        this.toast.success(`Statut mis à jour : ${STATUS_LABELS[status]}`);
        this.isUpdatingStatus.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors de la mise à jour du statut');
        this.isUpdatingStatus.set(false);
      },
    });
  }

  toggleCustomer(customerId: string) {
    this.expandedCustomers.update((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  }

  isExpanded(customerId: string): boolean {
    return this.expandedCustomers().has(customerId);
  }

  statusLabel(status: SaleItemStatus): string {
    return STATUS_LABELS[status];
  }

  statusStyle(status: SaleItemStatus): string {
    return STATUS_STYLES[status];
  }

  handleViewModeChange(mode: ViewMode) {
    this.viewMode.set(mode);
    this.page.set(1);
  }

  handleSearchChange(value: string) {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  handleStatusFilterChange(value: SaleItemStatus | 'ALL') {
    this.statusFilter.set(value);
    this.page.set(1);
  }

  onPageChange(p: number) {
    this.page.set(p);
  }

  trackByOrderKey(_index: number, order: GroupedOrder) {
    return order.key;
  }
}
