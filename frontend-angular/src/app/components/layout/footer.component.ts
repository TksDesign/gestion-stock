import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 bg-white dark:bg-gray-900 w-full mt-auto">
      <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <span class="text-4xl font-serif font-black tracking-widest text-gray-900 dark:text-white">KSHOP</span>
        <nav class="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 font-semibold tracking-wide">
          <a href="#" class="hover:text-black dark:hover:text-white transition-colors">Support</a>
          <a href="#" class="hover:text-black dark:hover:text-white transition-colors">Invoicing</a>
          <a href="#" class="hover:text-black dark:hover:text-white transition-colors">Contract</a>
          <a href="#" class="hover:text-black dark:hover:text-white transition-colors">Careers</a>
          <a href="#" class="hover:text-black dark:hover:text-white transition-colors">Blog</a>
          <a href="#" class="hover:text-black dark:hover:text-white transition-colors">FAQs</a>
        </nav>
      </div>
      <p class="text-center text-xs text-gray-400 font-medium">Copyright © 2026 KSHOP. All Rights Reserved.</p>
    </footer>
  `,
})
export class FooterComponent {}
