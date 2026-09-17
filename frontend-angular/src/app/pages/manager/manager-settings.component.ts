import { Component, OnInit, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Store as StoreIcon, MapPin, Activity, CalendarDays, Save, ShieldCheck } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ShopSettingsActions } from '../../store/shop-settings/shop-settings.actions';
import { selectShopData, selectShopLoading, selectShopUpdating } from '../../store/shop-settings/shop-settings.selectors';

@Component({
  selector: 'app-manager-settings',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './manager-settings.component.html',
})
export class ManagerSettingsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly icons = { Store: StoreIcon, MapPin, Activity, CalendarDays, Save, ShieldCheck };

  readonly shop = this.store.selectSignal(selectShopData);
  readonly isLoading = this.store.selectSignal(selectShopLoading);
  readonly isSaving = this.store.selectSignal(selectShopUpdating); // Renamed from isPending to isSaving

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    street: [''],
    city: [''],
    zipCode: [''],
  });

  constructor() {
    effect(() => {
      const currentShop = this.shop();
      if (currentShop) {
        this.form.patchValue({
          name: currentShop.name,
          description: currentShop.description || '',
          street: currentShop.street || '',
          city: currentShop.city || '',
          zipCode: currentShop.zipCode || ''
        });
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(ShopSettingsActions.loadShop());
  }

  submit() {
    if (this.form.invalid) return;
    this.store.dispatch(
      ShopSettingsActions.updateShop({
        data: this.form.getRawValue()
      })
    );
  }
}
