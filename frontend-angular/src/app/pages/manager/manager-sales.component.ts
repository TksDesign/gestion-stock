import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShoppingCart, Receipt, CheckCircle2, Search, X, Users } from 'lucide-angular';
import { ShopManagerService } from '../../features/shop/api/shop.service';
import { SaleResponse, StockItemResponse } from '../../features/shop/types/shop.types';
import { ToastService } from '../../core/services/toast.service';
import { CustomerOrdersPanelComponent } from './customer-orders-panel.component';

interface PosCartItem {
  stockItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

type Tab = 'pos' | 'orders';

@Component({
  selector: 'app-manager-sales',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CustomerOrdersPanelComponent],
  templateUrl: './manager-sales.component.html',
})
export class ManagerSalesComponent implements OnInit {
  private readonly shopManagerService = inject(ShopManagerService);
  private readonly toast = inject(ToastService);

  readonly icons = { ShoppingCart, Receipt, CheckCircle2, Search, X, Users };

  readonly stockItems = signal<StockItemResponse[]>([]);
  readonly sales = signal<SaleResponse[]>([]);
  readonly isStockLoading = signal(true);
  readonly isSalesLoading = signal(true);
  readonly isCreating = signal(false);

  readonly cart = signal<PosCartItem[]>([]);
  readonly searchQuery = signal('');
  readonly tab = signal<Tab>('pos');

  readonly onlineOrdersCount = computed(() => this.sales().filter((s) => s.source === 'ONLINE').length);

  readonly cartTotal = computed(() => this.cart().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.stockItems().filter(
      (item) => item.name.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q)),
    );
  });

  ngOnInit() {
    this.shopManagerService.getStock().subscribe({
      next: (data) => {
        this.stockItems.set(data);
        this.isStockLoading.set(false);
      },
      error: () => this.isStockLoading.set(false),
    });
    this.loadSales();
  }

  private loadSales() {
    this.shopManagerService.getSales().subscribe({
      next: (data) => {
        this.sales.set(data);
        this.isSalesLoading.set(false);
      },
      error: () => this.isSalesLoading.set(false),
    });
  }

  cartQuantityFor(itemId: number): number {
    return this.cart().find((c) => c.stockItemId === itemId)?.quantity ?? 0;
  }

  addToCart(item: StockItemResponse) {
    if (item.quantity <= 0) {
      this.toast.error('Out of stock!');
      return;
    }
    const existing = this.cart().find((i) => i.stockItemId === item.id);
    if (existing) {
      if (existing.quantity >= item.quantity) {
        this.toast.error('Not enough stock available');
        return;
      }
      this.cart.update((prev) =>
        prev.map((i) => (i.stockItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
      );
      return;
    }
    this.cart.update((prev) => [
      ...prev,
      { stockItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 },
    ]);
  }

  removeFromCart(id: number) {
    this.cart.update((prev) => prev.filter((i) => i.stockItemId !== id));
  }

  handleCheckout() {
    if (this.cart().length === 0) return;
    this.isCreating.set(true);
    this.shopManagerService
      .createSale({ items: this.cart().map((i) => ({ stockItemId: i.stockItemId, quantity: i.quantity })) })
      .subscribe({
        next: () => {
          this.toast.success('Sale completed successfully!');
          this.cart.set([]);
          this.isCreating.set(false);
          this.loadSales();
          this.shopManagerService.getStock().subscribe((data) => this.stockItems.set(data));
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Error processing sale');
          this.isCreating.set(false);
        },
      });
  }
}
