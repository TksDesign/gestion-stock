import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input() set page(value: number) {
    this._page.set(value);
  }
  get page(): number {
    return this._page();
  }
  private readonly _page = signal(1);

  @Input() set totalItems(value: number) {
    this._totalItems.set(value);
  }
  readonly _totalItems = signal(0);

  @Input() set pageSize(value: number) {
    this._pageSize.set(value);
  }
  private readonly _pageSize = signal(5);

  @Input() itemLabel = 'résultats';

  @Output() pageChange = new EventEmitter<number>();

  readonly icons = { ChevronLeft, ChevronRight };

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this._totalItems() / this._pageSize())));

  readonly start = computed(() => (this._page() - 1) * this._pageSize() + 1);
  readonly end = computed(() => Math.min(this._page() * this._pageSize(), this._totalItems()));

  readonly pages = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this._page();
    const windowSize = 1;
    const result: (number | 'ellipsis')[] = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || (p >= current - windowSize && p <= current + windowSize)) {
        result.push(p);
      } else if (result[result.length - 1] !== 'ellipsis') {
        result.push('ellipsis');
      }
    }
    return result;
  });

  goTo(p: number) {
    this.pageChange.emit(p);
  }
}
