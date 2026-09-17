import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-image-zoom',
  standalone: true,
  template: `
    <div
      class="w-full aspect-[3/4] md:aspect-auto md:h-[90vh] bg-gray-100 dark:bg-gray-800 overflow-hidden relative cursor-crosshair rounded-sm shadow-sm"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
      (mousemove)="onMouseMove($event)"
    >
      <img [src]="src" class="w-full h-full object-cover transition-opacity duration-300" [class.opacity-0]="isHovered()" [class.opacity-100]="!isHovered()" alt="Product View" />
      <div
        class="absolute inset-0 pointer-events-none transition-opacity duration-300"
        [style.backgroundImage]="'url(' + src + ')'"
        [style.backgroundPosition]="mousePos().x + '% ' + mousePos().y + '%'"
        [style.backgroundSize]="'200%'"
        [style.opacity]="isHovered() ? 1 : 0"
      ></div>
    </div>
  `,
})
export class ImageZoomComponent {
  @Input({ required: true }) src!: string;

  readonly mousePos = signal({ x: 50, y: 50 });
  readonly isHovered = signal(false);

  onMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const { left, top, width, height } = target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    this.mousePos.set({ x, y });
  }
}
