import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../../../components/ui/button.component';
import { CartActions } from '../../../store/cart/cart.actions';
import { ProductCardData } from './product-card.component';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './quick-view-modal.component.html',
})
export class QuickViewModalComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input({ required: true }) product!: ProductCardData;
  @Output() close = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    document.body.appendChild(this.elementRef.nativeElement);
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.remove();
    document.body.style.overflow = 'unset';
  }

  handleAddToCart() {
    this.store.dispatch(
      CartActions.addToCart({
        item: {
          productId: this.product.id,
          name: this.product.title,
          price: this.product.price,
          quantity: 1,
          imageUrl: this.product.imageUrl,
          variant: 'Default',
        },
      }),
    );
    this.close.emit();
    this.store.dispatch(CartActions.openCart());
  }
}
