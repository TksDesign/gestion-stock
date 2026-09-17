import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Package, AlertTriangle, Diamond, TrendingUp, ArrowUpRight } from 'lucide-angular';
import { ManagerDashboardActions } from '../../store/manager-dashboard/manager-dashboard.actions';
import { selectDashboardData, selectDashboardError, selectDashboardLoading } from '../../store/manager-dashboard/manager-dashboard.selectors';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './manager-dashboard.component.html',
})
export class ManagerDashboardComponent implements OnInit {
  private readonly store = inject(Store);

  readonly icons = { Package, AlertTriangle, Diamond, TrendingUp, ArrowUpRight };

  readonly dashboard = this.store.selectSignal(selectDashboardData);
  readonly isLoading = this.store.selectSignal(selectDashboardLoading);
  readonly error = this.store.selectSignal(selectDashboardError);

  ngOnInit() {
    this.store.dispatch(ManagerDashboardActions.loadDashboard());
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
