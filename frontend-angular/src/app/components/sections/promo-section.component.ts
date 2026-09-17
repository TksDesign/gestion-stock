import { Component } from '@angular/core';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-promo-section',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <section class="w-full bg-[#E5E5E5] dark:bg-gray-800 mt-16 overflow-hidden relative">
      <div class="container mx-auto px-0 lg:px-4 flex flex-col lg:flex-row h-auto lg:h-[600px]">
        <div class="lg:w-1/2 h-[400px] lg:h-full relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&q=80&w=800"
            class="w-full h-[130%] object-cover object-top absolute top-0"
            alt="Peaky Blinders Promo"
          />
        </div>

        <div class="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
          <div class="bg-white dark:bg-gray-900 p-10 lg:p-16 shadow-2xl relative z-10 max-w-lg w-full animate-in fade-in slide-in-from-right-8 duration-700">
            <p class="text-gray-500 uppercase tracking-[0.3em] text-xs font-semibold mb-4">Women Collection</p>
            <h2 class="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">Peaky Blinders</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6 text-sm underline underline-offset-4 decoration-gray-300">Description</p>
            <p class="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis aliquam, aliquet faucibus mi eros justo.
            </p>

            <div class="flex items-center gap-4">
              <span class="text-xl font-bold text-gray-900 dark:text-white">$100.00</span>
              <app-button variant="primary" extraClass="rounded-none bg-black text-white dark:bg-white dark:text-black px-8 py-3 text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg">Buy Now</app-button>
            </div>
          </div>

          <div class="absolute top-10 right-10 w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-full opacity-30 pointer-events-none"></div>
        </div>
      </div>
    </section>
  `,
})
export class PromoSectionComponent {}
