import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 class="text-9xl font-bold text-gray-300">404</h1>
      <h2 class="text-3xl font-semibold text-gray-800 mt-4">Page introuvable</h2>
      <p class="text-gray-600 mt-2 mb-8 max-w-md">
        Oups ! La page que vous recherchez semble avoir disparu, été supprimée ou n'a peut-être jamais existé.
      </p>
      <a routerLink="/" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200">
        Retour à l'accueil
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
