import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Heart, Eye } from 'lucide-angular';
import { CartActions } from '../../../store/cart/cart.actions';
import { FavoritesActions } from '../../../store/favorites/favorites.actions';
import { selectIsFavorite } from '../../../store/favorites/favorites.selectors';

export interface ProductCardData {
  id: number;
  title: string;
  brand: string | null | undefined;
  price: number;
  imageUrl: string;
  colors?: string[];
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent implements OnInit {
  private readonly store = inject(Store);

  @Input({ required: true }) product!: ProductCardData;
  @Output() quickView = new EventEmitter<void>();

  readonly icons = { Heart, Eye };
  readonly isHovered = signal(false);

  isFav = signal(false);

  ngOnInit() {
    this.store.select(selectIsFavorite(this.product.id)).subscribe((v) => this.isFav.set(v));
  }

  handleQuickAdd(e: Event) {
    e.preventDefault();
    e.stopPropagation();
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
    this.store.dispatch(CartActions.openCart());
  }

  toggleFavorite(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.store.dispatch(FavoritesActions.toggleFavorite({ id: this.product.id }));
  }

  handleQuickView(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.quickView.emit();
  }
}
