import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShopAdminService } from '../../features/shop/api/shop.service';
import { AuthService } from '../../features/auth/api/auth.service';
import { ShopResponse } from '../../features/shop/types/shop.types';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-shops',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-shops.component.html',
})
export class AdminShopsComponent implements OnInit {
  private readonly shopAdminService = inject(ShopAdminService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly shops = signal<ShopResponse[]>([]);
  readonly isLoading = signal(true);
  readonly isModalOpen = signal(false);
  readonly isCreating = signal(false);
  readonly editingShop = signal<ShopResponse | null>(null);
  readonly isUpdating = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    m_firstname: ['', Validators.required],
    m_lastname: ['', Validators.required],
    m_email: ['', [Validators.required, Validators.email]],
    m_password: ['', [Validators.required, Validators.minLength(6)]],
    s_name: ['', Validators.required],
    s_desc: [''],
    s_street: [''],
    s_zip: [''],
    s_city: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    street: [''],
    zipCode: [''],
    city: [''],
  });

  ngOnInit() {
    this.loadShops();
  }

  private loadShops() {
    this.shopAdminService.listAllShops().subscribe({
      next: (data) => {
        this.shops.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  handleToggleStatus(shop: ShopResponse) {
    const next = shop.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.shopAdminService.setStatus(shop.id, next).subscribe((updated) => {
      this.shops.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
    });
  }

  openCreateModal() {
    this.createForm.reset();
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
    const v = this.createForm.getRawValue();
    this.isCreating.set(true);

    this.authService
      .createShopManager({
        firstname: v.m_firstname,
        lastname: v.m_lastname,
        email: v.m_email,
        password: v.m_password,
      })
      .subscribe({
        next: (managerRes) => {
          this.shopAdminService
            .createShop({
              name: v.s_name,
              description: v.s_desc,
              street: v.s_street,
              city: v.s_city,
              zipCode: v.s_zip,
              managerId: managerRes.userId,
              managerEmail: managerRes.email,
            })
            .subscribe({
              next: (shop) => {
                this.shops.update((list) => [...list, shop]);
                this.toast.success('Boutique et gérante créées avec succès !');
                this.isCreating.set(false);
                this.isModalOpen.set(false);
              },
              error: () => {
                this.toast.error('Erreur lors de la création de la boutique');
                this.isCreating.set(false);
              },
            });
        },
        error: (err) => {
          this.toast.error(err.error?.errors?.error || 'Erreur lors de la création de la gérante');
          this.isCreating.set(false);
        },
      });
  }

  openEditModal(shop: ShopResponse) {
    this.editForm.setValue({
      name: shop.name,
      description: shop.description ?? '',
      street: shop.street ?? '',
      zipCode: shop.zipCode ?? '',
      city: shop.city ?? '',
    });
    this.editingShop.set(shop);
  }

  closeEditModal() {
    this.editingShop.set(null);
  }

  submitEdit() {
    const shop = this.editingShop();
    if (!shop || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isUpdating.set(true);
    this.shopAdminService.updateShop(shop.id, this.editForm.getRawValue()).subscribe({
      next: (updated) => {
        this.shops.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.toast.success('Boutique mise à jour !');
        this.isUpdating.set(false);
        this.editingShop.set(null);
      },
      error: () => {
        this.toast.error('Erreur lors de la mise à jour');
        this.isUpdating.set(false);
      },
    });
  }
}
