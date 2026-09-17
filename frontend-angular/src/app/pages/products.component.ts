import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent, ProductCardData } from '../features/products/components/product-card.component';
import { QuickViewModalComponent } from '../features/products/components/quick-view-modal.component';
import { PromoSectionComponent } from '../components/sections/promo-section.component';
import { FeaturesSectionComponent } from '../components/sections/features-section.component';
import { InstagramSectionComponent } from '../components/sections/instagram-section.component';
import { NewsletterSectionComponent } from '../components/sections/newsletter-section.component';
import { ProductService } from '../features/products/api/product.service';
import { CategoryService } from '../features/shop/api/shop.service';
import { CategoryResponse } from '../features/shop/types/shop.types';
import { Product } from '../features/products/types/product.types';

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

interface CatalogCard extends ProductCardData {
  category: string | null | undefined;
  sizes: string[];
}

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: '0-50', label: '$0 - $50', min: 0, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-150', label: '$100 - $150', min: 100, max: 150 },
  { id: '150+', label: '$150+', min: 150, max: Infinity },
];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    FormsModule,
    ProductCardComponent,
    QuickViewModalComponent,
    PromoSectionComponent,
    FeaturesSectionComponent,
    InstagramSectionComponent,
    NewsletterSectionComponent,
  ],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  readonly activeSize = signal<string | null>(null);
  readonly activeColor = signal<string | null>(null);
  readonly activePriceRange = signal<string | null>(null);
  readonly activeCategory = signal<string | null>(null);
  readonly sortBy = signal('Newest');
  readonly quickViewProduct = signal<CatalogCard | null>(null);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly apiProducts = signal<Product[] | null>(null);
  readonly isLoading = signal(true);
  readonly isError = signal(false);

  readonly sizes = ['S', 'M', 'L', 'XL'];
  readonly colors = ['#000', '#FDE047', '#93C5FD', '#FBCFE8', '#86EFAC', '#3B82F6', '#F9A8D4'];
  readonly priceRanges = PRICE_RANGES;

  readonly mappedProducts = computed<CatalogCard[]>(() =>
    (this.apiProducts() ?? []).map((p, index) => ({
      id: p.id,
      title: p.name,
      brand: p.categoryName,
      category: p.categoryName,
      price: p.price,
      imageUrl: TECH_IMAGES[index % TECH_IMAGES.length],
      colors: ['#000', '#FDE047'],
      sizes: ['M', 'L'],
    })),
  );

  readonly filteredProducts = computed(() => {
    const size = this.activeSize();
    const color = this.activeColor();
    const category = this.activeCategory();
    const priceRangeId = this.activePriceRange();

    const base = this.mappedProducts().filter((p) => {
      const matchSize = size ? p.sizes?.includes(size) : true;
      const matchColor = color ? p.colors?.includes(color) : true;
      const matchCategory = category ? p.category === category : true;

      let matchPrice = true;
      if (priceRangeId && priceRangeId !== 'all') {
        const range = PRICE_RANGES.find((r) => r.id === priceRangeId);
        if (range) matchPrice = p.price >= range.min && p.price <= range.max;
      }

      return matchSize && matchColor && matchCategory && matchPrice;
    });

    const sortBy = this.sortBy();
    return [...base].sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      return b.id - a.id;
    });
  });

  readonly hasActiveFilters = computed(() => !!(this.activeSize() || this.activeColor() || this.activeCategory()));

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
    this.categoryService.findAll().subscribe((data) => this.categories.set(data));
  }

  setCategory(name: string | null) {
    this.activeCategory.set(this.activeCategory() === name ? null : name);
  }

  setSize(size: string) {
    this.activeSize.set(this.activeSize() === size ? null : size);
  }

  setColor(color: string) {
    this.activeColor.set(this.activeColor() === color ? null : color);
  }

  clearFilters() {
    this.activeSize.set(null);
    this.activeColor.set(null);
    this.activeCategory.set(null);
  }
}
