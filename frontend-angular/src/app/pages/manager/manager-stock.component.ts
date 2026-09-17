import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Filter, Edit2, Trash2, Package } from 'lucide-angular';
import { ShopManagerService, CategoryService } from '../../features/shop/api/shop.service';
import { CategoryResponse, StockItemResponse } from '../../features/shop/types/shop.types';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../components/ui/modal.component';

@Component({
  selector: 'app-manager-stock',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './manager-stock.component.html',
})
export class ManagerStockComponent implements OnInit {
  private readonly shopManagerService = inject(ShopManagerService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly icons = { Plus, Search, Filter, Edit2, Trash2, Package };

  readonly stockItems = signal<StockItemResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly isLoading = signal(true);
  readonly isCreating = signal(false);
  readonly isUpdating = signal(false);
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
    this.loadStock();
    this.categoryService.findAll().subscribe((data) => this.categories.set(data));
  }

  private loadStock() {
    this.shopManagerService.getStock().subscribe({
      next: (data) => {
        this.stockItems.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
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
    this.isCreating.set(true);
    this.shopManagerService.createStockItem(this.createForm.getRawValue()).subscribe({
      next: (item) => {
        this.stockItems.update((list) => [...list, item]);
        this.toast.success('Article ajouté au stock !');
        this.isCreating.set(false);
        this.isModalOpen.set(false);
      },
      error: () => this.isCreating.set(false),
    });
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
    this.isUpdating.set(true);
    this.shopManagerService.updateStockItem(item.id, this.editForm.getRawValue()).subscribe({
      next: (updated) => {
        this.stockItems.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
        this.toast.success('Produit mis à jour !');
        this.isUpdating.set(false);
        this.editingItem.set(null);
      },
      error: () => {
        this.toast.error('Erreur lors de la mise à jour du produit');
        this.isUpdating.set(false);
      },
    });
  }

  handleDelete(item: StockItemResponse) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" du stock ?`)) return;
    this.shopManagerService.deleteStockItem(item.id).subscribe(() => {
      this.stockItems.update((list) => list.filter((i) => i.id !== item.id));
      this.toast.success('Article supprimé.');
    });
  }

  handleAdjust(item: StockItemResponse, delta: number) {
    if (item.quantity + delta < 0) return;
    this.shopManagerService.adjustQuantity(item.id, { delta }).subscribe((updated) => {
      this.stockItems.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
    });
  }
}
