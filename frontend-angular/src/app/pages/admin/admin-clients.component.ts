import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserSummary } from '../../features/auth/api/auth.service';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-clients.component.html',
})
export class AdminClientsComponent implements OnInit {
  private readonly authService = inject(AuthService);

  readonly clients = signal<UserSummary[]>([]);
  readonly isLoading = signal(true);
  readonly searchQuery = signal('');

  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.clients().filter(
      (c) => `${c.firstname} ${c.lastname}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  });

  ngOnInit() {
    this.authService.findUsers('CLIENT').subscribe({
      next: (data) => {
        this.clients.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
