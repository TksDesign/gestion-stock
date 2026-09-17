import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Store, MapPin, Activity, CalendarDays, Save, ShieldCheck } from 'lucide-angular';
import { ShopManagerService } from '../../features/shop/api/shop.service';
import { ShopResponse } from '../../features/shop/types/shop.types';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-manager-settings',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, DatePipe],
  templateUrl: './manager-settings.component.html',
})
export class ManagerSettingsComponent implements OnInit {
  private readonly shopManagerService = inject(ShopManagerService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly icons = { Store, MapPin, Activity, CalendarDays, Save, ShieldCheck };

  readonly shop = signal<ShopResponse | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    street: [''],
    city: [''],
    zipCode: [''],
  });

  ngOnInit() {
    this.shopManagerService.getMyShop().subscribe({
      next: (data) => {
        this.shop.set(data);
        this.form.setValue({
          name: data.name,
          description: data.description ?? '',
          street: data.street ?? '',
          city: data.city ?? '',
          zipCode: data.zipCode ?? '',
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.shopManagerService.updateMyShop(this.form.getRawValue()).subscribe({
      next: (updated) => {
        this.shop.set(updated);
        this.toast.success('Store settings updated successfully!');
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false),
    });
  }
}
