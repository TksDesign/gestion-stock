import { Injectable, signal } from '@angular/core';

export type AuthView = 'signin' | 'signup' | 'forgot' | 'verify';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  readonly isOpen = signal(false);
  readonly view = signal<AuthView>('signin');

  openModal(view: AuthView = 'signin') {
    this.view.set(view);
    this.isOpen.set(true);
  }

  closeModal() {
    this.isOpen.set(false);
  }

  setView(view: AuthView) {
    this.view.set(view);
  }
}
