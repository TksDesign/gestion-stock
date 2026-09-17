import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserSummary } from '../../features/auth/api/auth.service';
import { ShopAdminService } from '../../features/shop/api/shop.service';
import { ShopResponse } from '../../features/shop/types/shop.types';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-managers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-managers.component.html',
})
export class AdminManagersComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly shopAdminService = inject(ShopAdminService);
  private readonly toast = inject(ToastService);

  readonly managers = signal<UserSummary[]>([]);
  readonly shops = signal<ShopResponse[]>([]);
  readonly isLoading = signal(true);
  readonly isReassigning = signal(false);
  readonly searchQuery = signal('');
  readonly reassignTarget = signal<{ managerId: string; managerEmail: string } | null>(null);

  readonly shopByManagerId = computed(() => {
    const map = new Map<string, ShopResponse>();
    this.shops().forEach((s) => {
      if (s.managerId) map.set(s.managerId, s);
    });
    return map;
  });

  readonly unassignedShops = computed(() => this.shops().filter((s) => !s.managerId));

  readonly filteredManagers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.managers().filter(
      (m) => `${m.firstname} ${m.lastname}`.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  });

  ngOnInit() {
    this.authService.findUsers('SHOP_MANAGER').subscribe((data) => {
      this.managers.set(data);
      this.checkLoaded();
    });
    this.shopAdminService.listAllShops().subscribe((data) => {
      this.shops.set(data);
      this.checkLoaded();
    });
  }

  private loadedCount = 0;
  private checkLoaded() {
    this.loadedCount++;
    if (this.loadedCount >= 2) this.isLoading.set(false);
  }

  openAssignModal(managerId: string, managerEmail: string) {
    this.reassignTarget.set({ managerId, managerEmail });
  }

  closeAssignModal() {
    this.reassignTarget.set(null);
  }

  handleAssign(shopId: number, shopName: string) {
    const target = this.reassignTarget();
    if (!target) return;
    this.isReassigning.set(true);
    this.shopAdminService.reassignManager(shopId, target.managerId, target.managerEmail).subscribe({
      next: (updated) => {
        this.shops.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.toast.success(`Boutique "${shopName}" assignée`);
        this.reassignTarget.set(null);
        this.isReassigning.set(false);
      },
      error: () => {
        this.toast.error("Erreur lors de l'assignation");
        this.isReassigning.set(false);
      },
    });
  }
}
