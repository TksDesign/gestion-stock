import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { PromoSectionComponent } from '../components/sections/promo-section.component';
import { DealsSectionComponent } from '../components/sections/deals-section.component';
import { NewsletterSectionComponent } from '../components/sections/newsletter-section.component';
import { ProductService } from '../features/products/api/product.service';
import { Product } from '../features/products/types/product.types';
import { CartActions } from '../store/cart/cart.actions';
import { ImageZoomComponent } from '../features/products/components/image-zoom.component';

const TECH_IMAGES = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80',
  'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=1200&q=80',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80',
  'https://images.unsplash.com/photo-1494173853739-c21f58b16055?w=1200&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&q=80',
];

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, PromoSectionComponent, DealsSectionComponent, NewsletterSectionComponent, ImageZoomComponent],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly store = inject(Store);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(true);
  readonly isError = signal(false);

  readonly selectedSize = signal('M');
  readonly selectedColor = signal('#000000');
  readonly quantity = signal(1);
  readonly isAdded = signal(false);

  readonly sizes = ['S', 'M', 'L', 'XL'];
  readonly colorOptions = ['#000000', '#3B82F6', '#F43F5E'];

  readonly openDescription = signal(true);
  readonly openCategory = signal(false);
  readonly openShipping = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id') || '1');
    this.productService.findById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  mainImage(): string {
    const p = this.product();
    return p ? TECH_IMAGES[p.id % TECH_IMAGES.length] : TECH_IMAGES[0];
  }

  images(): string[] {
    const p = this.product();
    if (!p) return [];
    return [TECH_IMAGES[p.id % TECH_IMAGES.length], TECH_IMAGES[(p.id + 1) % TECH_IMAGES.length], TECH_IMAGES[(p.id + 2) % TECH_IMAGES.length]];
  }

  colorLabel(): string {
    const c = this.selectedColor();
    return c === '#000000' ? 'Midnight Black' : c === '#3B82F6' ? 'Ocean Blue' : 'Rose Red';
  }

  decreaseQty() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  increaseQty() {
    const p = this.product();
    if (!p) return;
    this.quantity.update((q) => Math.min(p.availableQuantity, q + 1));
  }

  handleAddToCart() {
    const p = this.product();
    if (!p) return;
    if (this.quantity() > p.availableQuantity) {
      alert(`Sorry, only ${p.availableQuantity} items available in stock.`);
      return;
    }

    this.isAdded.set(true);
    this.store.dispatch(
      CartActions.addToCart({
        item: {
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: this.quantity(),
          imageUrl: this.mainImage(),
          variant: `${this.selectedSize()} / ${this.selectedColor()}`,
        },
      }),
    );

    setTimeout(() => {
      this.isAdded.set(false);
      this.store.dispatch(CartActions.openCart());
    }, 1500);
  }
}
