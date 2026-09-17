import { Component } from '@angular/core';

@Component({
  selector: 'app-features-section',
  standalone: true,
  template: `
    <section class="container mx-auto px-4 py-16 border-b border-gray-200 dark:border-gray-800">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100 dark:divide-gray-800 animate-in fade-in duration-700">
        @for (feat of features; track feat.title) {
          <div class="px-4 group cursor-pointer">
            <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-full group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110">
              <img [src]="feat.icon" class="w-7 opacity-60 dark:invert group-hover:opacity-100 transition-opacity duration-300" [alt]="feat.title" />
            </div>
            <h4 class="font-bold text-sm mb-2 text-gray-900 dark:text-white transition-colors group-hover:text-black dark:group-hover:text-gray-300">{{ feat.title }}</h4>
            <p class="text-xs text-gray-500 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-400">{{ feat.desc }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class FeaturesSectionComponent {
  readonly features = [
    { icon: 'https://cdn-icons-png.flaticon.com/512/3252/3252994.png', title: 'High Quality', desc: 'crafted from top materials' },
    { icon: 'https://cdn-icons-png.flaticon.com/512/3553/3553648.png', title: 'Warranty Protection', desc: 'over 2 years' },
    { icon: 'https://cdn-icons-png.flaticon.com/512/66/66841.png', title: 'Free Shipping', desc: 'order over $150' },
    { icon: 'https://cdn-icons-png.flaticon.com/512/3252/3252998.png', title: '24/7 Support', desc: 'dedicated support' },
  ];
}
