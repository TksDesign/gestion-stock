import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LucideAngularModule, ShoppingCart, Receipt, CheckCircle2, Search, X, History, Plus, Minus } from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import { ManagerSalesActions } from '../../store/manager-sales/manager-sales.actions';
import { selectSalesStockItems, selectSalesHistory, selectSalesStockLoading, selectSalesHistoryLoading, selectSalesCreating } from '../../store/manager-sales/manager-sales.selectors';
import { StockItemResponse } from '../../features/shop/types/shop.types';

type CartItem = {
  stockItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
};

@Component({
  selector: 'app-manager-sales',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './manager-sales.component.html',
})
export class ManagerSalesComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly toast = inject(ToastService);

  readonly icons = { ShoppingCart, Receipt, CheckCircle2, Search, X, History, Plus, Minus };

  readonly stockItems = this.store.selectSignal(selectSalesStockItems);
  readonly sales = this.store.selectSignal(selectSalesHistory);
  readonly isStockLoading = this.store.selectSignal(selectSalesStockLoading);
  readonly isSalesLoading = this.store.selectSignal(selectSalesHistoryLoading);
  readonly isCreating = this.store.selectSignal(selectSalesCreating);

  readonly cart = signal<CartItem[]>([]);
  readonly searchQuery = signal('');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.stockItems().filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)),
    );
  });

  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  ngOnInit() {
    this.store.dispatch(ManagerSalesActions.loadStock());
    this.store.dispatch(ManagerSalesActions.loadSales());
  }

  addToCart(item: StockItemResponse) {
    if (item.quantity <= 0) {
      this.toast.error('En rupture de stock !');
      return;
    }

    this.cart.update((prev) => {
      const existing = prev.find((i) => i.stockItemId === item.id);
      if (existing) {
        if (existing.quantity >= item.quantity) {
          this.toast.error('Pas assez de stock disponible');
          return prev;
        }
        return prev.map((i) =>
          i.stockItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        { stockItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  removeFromCart(id: number) {
    this.cart.update((prev) => prev.filter((i) => i.stockItemId !== id));
  }

  handleCheckout() {
    const currentCart = this.cart();
    if (currentCart.length === 0) return;

    this.store.dispatch(
      ManagerSalesActions.createSale({
        data: { items: currentCart.map((i) => ({ stockItemId: i.stockItemId, quantity: i.quantity })) },
      })
    );
    this.cart.set([]);
  }

  getCartQuantity(itemId: number): number {
    return this.cart().find((c) => c.stockItemId === itemId)?.quantity || 0;
  }
}
