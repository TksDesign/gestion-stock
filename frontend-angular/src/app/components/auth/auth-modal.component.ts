import { Component, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../ui/button.component';
import { AuthModalService, AuthView } from '../../core/services/auth-modal.service';
import { AuthService } from '../../features/auth/api/auth.service';
import { AuthActions } from '../../store/auth/auth.actions';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './auth-modal.component.html',
})
export class AuthModalComponent implements OnInit, OnDestroy {
  readonly authModal = inject(AuthModalService);
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly imgLeft = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800';

  constructor() {
    effect(() => {
      document.body.style.overflow = this.authModal.isOpen() ? 'hidden' : 'unset';
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    document.body.style.overflow = 'unset';
  }

  setView(view: AuthView) {
    this.authModal.setView(view);
  }

  closeModal() {
    this.authModal.closeModal();
  }

  handleLogin(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    this.loading.set(true);
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.store.dispatch(
          AuthActions.login({
            user: {
              id: response.userId,
              firstname: response.firstname,
              lastname: response.lastname,
              email: response.email,
              role: response.role,
              customerId: response.customerId,
            },
            token: response.token,
          }),
        );
        this.toast.success(`Bienvenue, ${response.firstname} !`);
        this.closeModal();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      this.toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);
    this.authService.register({ firstname, lastname, email, password }).subscribe({
      next: (response) => {
        this.store.dispatch(
          AuthActions.login({
            user: {
              id: response.userId,
              firstname: response.firstname,
              lastname: response.lastname,
              email: response.email,
              role: response.role,
              customerId: response.customerId,
            },
            token: response.token,
          }),
        );
        this.toast.success('Compte créé avec succès !');
        this.closeModal();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  handleForgotSubmit(e: Event) {
    e.preventDefault();
    this.setView('verify');
  }

  handleVerifySubmit(e: Event) {
    e.preventDefault();
    this.setView('signin');
  }
}
