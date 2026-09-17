import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-newsletter-section',
  standalone: true,
  templateUrl: './newsletter-section.component.html',
})
export class NewsletterSectionComponent {
  readonly isSubscribed = signal(false);
  readonly isSectionHovered = signal(false);

  handleSubmit(e: Event) {
    e.preventDefault();
    this.isSubscribed.set(true);
    setTimeout(() => this.isSubscribed.set(false), 4000);
  }
}
