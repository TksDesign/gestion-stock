import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../ui/button.component';
import { CartActions } from '../../store/cart/cart.actions';
import { selectCartIsOpen, selectCartItems, selectCartTotal } from '../../store/cart/cart.selectors';

const FREE_SHIPPING_THRESHOLD = 150;

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './mini-cart.component.html',
})
export class MiniCartComponent {
  private readonly store = inject(Store);

  readonly isOpen = this.store.selectSignal(selectCartIsOpen);
  readonly items = this.store.selectSignal(selectCartItems);
  readonly cartTotal = this.store.selectSignal(selectCartTotal);
  readonly isGiftWrapped = signal(false);

  readonly subtotal = computed(() => this.cartTotal() + (this.isGiftWrapped() ? 10 : 0));
  readonly amountToFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - this.subtotal()));

  closeCart() {
    this.store.dispatch(CartActions.closeCart());
  }

  removeFromCart(productId: number, variant?: string) {
    this.store.dispatch(CartActions.removeFromCart({ productId, variant }));
  }

  updateQuantity(productId: number, variant: string | undefined, quantity: number) {
    this.store.dispatch(CartActions.updateQuantity({ productId, variant, quantity }));
  }
}
