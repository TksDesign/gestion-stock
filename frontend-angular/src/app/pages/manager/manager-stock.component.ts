import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Filter, Edit2, Trash2, Package } from 'lucide-angular';
import { Store } from '@ngrx/store';
import { StockItemResponse } from '../../features/shop/types/shop.types';
import { ModalComponent } from '../../components/ui/modal.component';
import { ManagerStockActions } from '../../store/manager-stock/manager-stock.actions';
import { selectStockItems, selectStockCategories, selectStockLoading, selectStockCreating, selectStockUpdating } from '../../store/manager-stock/manager-stock.selectors';

@Component({
  selector: 'app-manager-stock',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './manager-stock.component.html',
})
export class ManagerStockComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly icons = { Plus, Search, Filter, Edit2, Trash2, Package };

  readonly stockItems = this.store.selectSignal(selectStockItems);
  readonly categories = this.store.selectSignal(selectStockCategories);
  readonly isLoading = this.store.selectSignal(selectStockLoading);
  readonly isCreating = this.store.selectSignal(selectStockCreating);
  readonly isUpdating = this.store.selectSignal(selectStockUpdating);
  
  readonly isModalOpen = signal(false);
  readonly editingItem = signal<StockItemResponse | null>(null);
  readonly searchQuery = signal('');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.stockItems().filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)),
    );
  });

  readonly editingCategoryIsLegacy = computed(() => {
    const item = this.editingItem();
    if (!item?.category) return false;
    return !this.categories().some((c) => c.name === item.category);
  });

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5, [Validators.min(0)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [0, [Validators.min(0)]],
  });

  ngOnInit() {
    this.store.dispatch(ManagerStockActions.loadStock());
    this.store.dispatch(ManagerStockActions.loadCategories());
  }

  isLow(item: StockItemResponse): boolean {
    return item.quantity <= (item.lowStockThreshold || 5);
  }

  openCreateModal() {
    this.createForm.reset({ name: '', category: '', price: 0, quantity: 0, lowStockThreshold: 5 });
    this.isModalOpen.set(true);
  }

  closeCreateModal() {
    this.isModalOpen.set(false);
  }

  submitCreate() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.store.dispatch(ManagerStockActions.createItem({ data: this.createForm.getRawValue() }));
    // Note: in a real app we might close modal only on success using an Effect, 
    // but for simplicity we close it immediately or wait for loading state.
    this.isModalOpen.set(false);
  }

  openEditModal(item: StockItemResponse) {
    this.editForm.setValue({
      name: item.name,
      category: item.category ?? '',
      price: item.price,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
    });
    this.editingItem.set(item);
  }

  closeEditModal() {
    this.editingItem.set(null);
  }

  submitEdit() {
    const item = this.editingItem();
    if (!item || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.store.dispatch(ManagerStockActions.updateItem({ id: item.id, data: this.editForm.getRawValue() }));
    this.editingItem.set(null);
  }

  handleDelete(item: StockItemResponse) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" du stock ?`)) return;
    this.store.dispatch(ManagerStockActions.deleteItem({ id: item.id }));
  }

  handleAdjust(item: StockItemResponse, delta: number) {
    if (item.quantity + delta < 0) return;
    this.store.dispatch(ManagerStockActions.adjustQuantity({ id: item.id, data: { delta } }));
  }
}
