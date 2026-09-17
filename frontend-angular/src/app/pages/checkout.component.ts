import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../components/ui/button.component';
import { NewsletterSectionComponent } from '../components/sections/newsletter-section.component';
import { selectCartItems, selectCartTotal } from '../store/cart/cart.selectors';
import { CartActions } from '../store/cart/cart.actions';
import { selectCurrentUser } from '../store/auth/auth.selectors';
import { OrderService } from '../features/orders/api/order.service';
import { PaymentMethod } from '../features/orders/types/order.types';
import { ToastService } from '../core/services/toast.service';
import { AuthModalService } from '../core/services/auth-modal.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, NewsletterSectionComponent],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly authModal = inject(AuthModalService);

  readonly items = this.store.selectSignal(selectCartItems);
  readonly cartTotal = this.store.selectSignal(selectCartTotal);
  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly isSubmitting = signal(false);

  readonly subtotal = computed(() => this.cartTotal());
  readonly shipping = computed(() => (this.subtotal() > 150 ? 0 : 4.0));
  readonly total = computed(() => this.subtotal() + this.shipping());

  readonly form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    cardNumber: ['', Validators.required],
    expirationDate: ['', Validators.required],
    securityCode: ['', Validators.required],
    cardHolderName: ['', Validators.required],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.user();
    if (!user) {
      this.toast.error('You must be logged in to checkout.');
      return;
    }

    this.isSubmitting.set(true);
    this.orderService
      .create({
        amount: this.total(),
        paymentMethod: PaymentMethod.CREDIT_CARD,
        customerId: user.customerId || user.id,
        products: this.items().map((item) => ({
          productId: Number(item.productId),
          quantity: item.quantity,
        })),
      })
      .subscribe({
        next: () => {
          this.toast.success('Commande créée avec succès !');
          this.store.dispatch(CartActions.clearCart());
          this.isSubmitting.set(false);
          this.router.navigateByUrl('/success');
        },
        error: () => {
          this.toast.error('Erreur lors de la validation de la commande.');
          this.isSubmitting.set(false);
        },
      });
  }
}
