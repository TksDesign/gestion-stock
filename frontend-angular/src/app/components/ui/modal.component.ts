import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// Rendu directement sous <body> (comme le createPortal React) : un modal imbriqué dans
// une mise en page qui pose un z-index sur ses éléments (ex. ManagerLayout, sidebar en
// z-10) ne peut jamais dépasser visuellement ce parent quel que soit son propre z-index
// local — la pile d'empilement (stacking context) est hiérarchique.
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        (click)="close.emit()"
      ></div>
      <div
        class="relative bg-white dark:bg-[#111111] rounded-3xl p-8 w-full {{ maxWidth }} shadow-[0_24px_60px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() maxWidth = 'max-w-lg';
  @Output() close = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    document.body.appendChild(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.remove();
  }
}
