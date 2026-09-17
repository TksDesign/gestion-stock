import { Component, signal } from '@angular/core';

const instaImages = [
  'photo-1611186871340-1b26bc6594b5',
  'photo-1618366712010-f4ae9c647dcb',
  'photo-1603302576837-37561b2e2302',
  'photo-1525547719571-a2d4ac8945e2',
  'photo-1494173853739-c21f58b16055',
  'photo-1516035069371-29a1b244cc32',
];

@Component({
  selector: 'app-instagram-section',
  standalone: true,
  templateUrl: './instagram-section.component.html',
})
export class InstagramSectionComponent {
  readonly indices = [0, 1, 2, 3, 4, 5];
  readonly hoveredIndex = signal<number | null>(null);

  imageUrl(index: number): string {
    return `https://images.unsplash.com/${instaImages[index % instaImages.length]}?auto=format&fit=crop&q=80&w=800`;
  }
}
