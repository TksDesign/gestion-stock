import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastContainerComponent } from './core/services/toast-container.component';
import { MiniCartComponent } from './components/cart/mini-cart.component';
import { AuthModalComponent } from './components/auth/auth-modal.component';
import { selectTheme } from './store/theme/theme.selectors';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, MiniCartComponent, AuthModalComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly store = inject(Store);
  readonly theme = this.store.selectSignal(selectTheme);

  ngOnInit() {
    const root = document.documentElement;
    if (this.theme() === 'dark') {
      root.classList.add('dark');
    }
    this.store.select(selectTheme).subscribe((theme) => {
      root.classList.toggle('dark', theme === 'dark');
    });
  }
}
