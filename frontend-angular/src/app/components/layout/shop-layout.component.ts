import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShopNavbarComponent } from './shop-navbar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [RouterOutlet, ShopNavbarComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-shop-navbar></app-shop-navbar>
      <router-outlet></router-outlet>
      <app-footer></app-footer>
    </div>
  `,
})
export class ShopLayoutComponent {}
