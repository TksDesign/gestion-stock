import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, Package, AlertTriangle, Diamond, TrendingUp, ArrowUpRight } from 'lucide-angular';
import { ShopManagerService } from '../../features/shop/api/shop.service';
import { DashboardResponse } from '../../features/shop/types/shop.types';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './manager-dashboard.component.html',
})
export class ManagerDashboardComponent implements OnInit {
  private readonly shopManagerService = inject(ShopManagerService);

  readonly icons = { Package, AlertTriangle, Diamond, TrendingUp, ArrowUpRight };

  readonly dashboard = signal<DashboardResponse | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal(false);

  ngOnInit() {
    this.shopManagerService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      },
    });
  }

  maxRevenue(): number {
    const d = this.dashboard();
    return d && d.topSellingItems.length ? d.topSellingItems[0].revenue : 1;
  }

  percentage(revenue: number): number {
    return Math.max(10, (revenue / this.maxRevenue()) * 100);
  }

  percentLeft(quantity: number, threshold: number): number {
    return Math.min(100, Math.max(0, (quantity / threshold) * 100));
  }
}
