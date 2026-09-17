import { Component, Input, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ButtonComponent } from '../ui/button.component';

interface DealImage {
  id: number;
  src: string;
  label: string;
  title: string;
  price: string;
  oldPrice: string;
}

@Component({
  selector: 'app-deals-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './deals-section.component.html',
})
export class DealsSectionComponent implements OnInit, OnDestroy {
  @Input() title = 'Deals Of The Month';

  readonly time = signal(2 * 86400 + 6 * 3600 + 5 * 60 + 30);
  readonly activeIndex = signal(1);
  readonly isGalleryHovered = signal(false);
  readonly isTimerHovered = signal(false);
  private timer?: ReturnType<typeof setInterval>;

  readonly timeData = computed(() => {
    const t = this.time();
    return [
      { num: String(Math.floor(t / 86400)).padStart(2, '0'), lbl: 'Days' },
      { num: String(Math.floor((t % 86400) / 3600)).padStart(2, '0'), lbl: 'Hr' },
      { num: String(Math.floor((t % 3600) / 60)).padStart(2, '0'), lbl: 'Mins' },
      { num: String(t % 60).padStart(2, '0'), lbl: 'Sec' },
    ];
  });

  readonly dealImages: DealImage[] = [
    { id: 0, src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400', label: '01 - Spring Sale', title: 'MacBook Air', price: '$85.00', oldPrice: '$110.00' },
    { id: 1, src: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400', label: '02 - Summer Sale', title: 'AirPods Pro 2', price: '$95.00', oldPrice: '$120.00' },
    { id: 2, src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400', label: '03 - Autumn Sale', title: 'Razer Blade 15', price: '$105.00', oldPrice: '$130.00' },
  ];

  ngOnInit() {
    this.timer = setInterval(() => this.time.update((t) => (t > 0 ? t - 1 : 0)), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  onGalleryLeave() {
    this.isGalleryHovered.set(false);
    this.activeIndex.set(1);
  }
}
