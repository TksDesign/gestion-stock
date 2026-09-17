import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../components/ui/button.component';
import { NewsletterSectionComponent } from '../components/sections/newsletter-section.component';
import { CartActions } from '../store/cart/cart.actions';
import { selectCartItems, selectCartTotal } from '../store/cart/cart.selectors';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, ButtonComponent, NewsletterSectionComponent],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(selectCartItems);
  readonly cartTotal = this.store.selectSignal(selectCartTotal);
  readonly isGiftWrapped = signal(false);

  readonly subtotal = computed(() => this.cartTotal() + (this.isGiftWrapped() ? 10 : 0));

  removeFromCart(productId: number, variant?: string) {
    this.store.dispatch(CartActions.removeFromCart({ productId, variant }));
  }

  updateQuantity(productId: number, variant: string | undefined, quantity: number) {
    this.store.dispatch(CartActions.updateQuantity({ productId, variant, quantity }));
  }
}
