import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Store as StoreIcon, MapPin, Activity, CalendarDays, Save, ShieldCheck } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ShopSettingsActions } from '../../store/shop-settings/shop-settings.actions';
import { selectShopData, selectShopLoading, selectShopUpdating } from '../../store/shop-settings/shop-settings.selectors';

@Component({
  selector: 'app-manager-settings',
  standalone: true,
  imports: [LucideAngularModule, FormsModule],
  templateUrl: './manager-settings.component.html',
})
export class ManagerSettingsComponent implements OnInit {
  private readonly store = inject(Store);

  readonly icons = { Store: StoreIcon, MapPin, Activity, CalendarDays, Save, ShieldCheck };

  readonly shop = this.store.selectSignal(selectShopData);
  readonly isLoading = this.store.selectSignal(selectShopLoading);
  readonly isPending = this.store.selectSignal(selectShopUpdating);

  ngOnInit() {
    this.store.dispatch(ShopSettingsActions.loadShop());
  }

  handleSave(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    this.store.dispatch(
      ShopSettingsActions.updateShop({
        data: {
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          street: formData.get('street') as string,
          city: formData.get('city') as string,
          zipCode: formData.get('zipCode') as string,
        }
      })
    );
  }
}
