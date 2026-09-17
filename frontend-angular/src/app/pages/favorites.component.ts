import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../components/ui/button.component';
import { ProductCardComponent, ProductCardData } from '../features/products/components/product-card.component';
import { QuickViewModalComponent } from '../features/products/components/quick-view-modal.component';
import { ProductService } from '../features/products/api/product.service';
import { Product } from '../features/products/types/product.types';
import { selectFavoriteIds } from '../store/favorites/favorites.selectors';

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
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, ButtonComponent, ProductCardComponent, QuickViewModalComponent],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly store = inject(Store);

  readonly favoriteIds = this.store.selectSignal(selectFavoriteIds);
  readonly quickViewProduct = signal<ProductCardData | null>(null);
  readonly apiProducts = signal<Product[] | null>(null);
  readonly isLoading = signal(true);
  readonly isError = signal(false);

  readonly mappedProducts = computed<ProductCardData[]>(() =>
    (this.apiProducts() ?? []).map((p, index) => ({
      id: p.id,
      title: p.name,
      brand: p.categoryName || 'Tech',
      price: p.price,
      imageUrl: TECH_IMAGES[index % TECH_IMAGES.length],
    })),
  );

  readonly favoriteProducts = computed(() => this.mappedProducts().filter((p) => this.favoriteIds().includes(Number(p.id))));

  ngOnInit() {
    this.productService.findAll().subscribe({
      next: (data) => {
        this.apiProducts.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
