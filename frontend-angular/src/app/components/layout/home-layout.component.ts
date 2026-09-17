import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeNavbarComponent } from './home-navbar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [RouterOutlet, HomeNavbarComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-home-navbar></app-home-navbar>
      <router-outlet></router-outlet>
      <app-footer></app-footer>
    </div>
  `,
})
export class HomeLayoutComponent {}
