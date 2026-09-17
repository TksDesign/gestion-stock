import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { ProductCardComponent, ProductCardData } from '../features/products/components/product-card.component';
import { QuickViewModalComponent } from '../features/products/components/quick-view-modal.component';
import { DealsSectionComponent } from '../components/sections/deals-section.component';
import { PromoSectionComponent } from '../components/sections/promo-section.component';
import { FeaturesSectionComponent } from '../components/sections/features-section.component';
import { InstagramSectionComponent } from '../components/sections/instagram-section.component';
import { TestimonialsSectionComponent } from '../components/sections/testimonials-section.component';
import { NewsletterSectionComponent } from '../components/sections/newsletter-section.component';
import { ProductService } from '../features/products/api/product.service';
import { CategoryService } from '../features/shop/api/shop.service';
import { CategoryResponse } from '../features/shop/types/shop.types';
import { Product } from '../features/products/types/product.types';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
];

const ALL_TAB = 'All';

interface ArrivalCard extends ProductCardData {
  category: string | null | undefined;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent,
    ProductCardComponent,
    QuickViewModalComponent,
    DealsSectionComponent,
    PromoSectionComponent,
    FeaturesSectionComponent,
    InstagramSectionComponent,
    TestimonialsSectionComponent,
    NewsletterSectionComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  readonly activeTab = signal<string>(ALL_TAB);
  readonly quickViewProduct = signal<ArrivalCard | null>(null);

  readonly apiProducts = signal<Product[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);

  readonly brands = ['CHANEL', 'LOUIS VUITTON', 'PRADA', 'Calvin Klein', 'DENIM'];

  readonly arrivals = computed<ArrivalCard[]>(() =>
    this.apiProducts().map((p, index) => ({
      id: p.id,
      title: p.name,
      brand: p.categoryName,
      category: p.categoryName,
      price: p.price,
      imageUrl: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    })),
  );

  readonly availableTabs = computed(() => {
    const categoryNamesWithProducts = new Set(this.arrivals().map((p) => p.category).filter(Boolean));
    const ordered = this.categories()
      .map((c) => c.name)
      .filter((name) => categoryNamesWithProducts.has(name));
    return [ALL_TAB, ...ordered];
  });

  readonly filteredArrivals = computed(() => {
    const all = this.arrivals();
    const filtered = this.activeTab() === ALL_TAB ? all : all.filter((p) => p.category === this.activeTab());
    return filtered.slice(0, 6);
  });

  ngOnInit() {
    this.productService.findAll().subscribe((data) => this.apiProducts.set(data));
    this.categoryService.findAll().subscribe((data) => this.categories.set(data));
  }

  goToProducts() {
    this.router.navigateByUrl('/products');
  }
}
