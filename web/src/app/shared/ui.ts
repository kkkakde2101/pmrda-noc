import { ChangeDetectionStrategy, Component, Directive, effect, EventEmitter, inject, input, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { ApplicationStatus, STATUS_BADGE, STATUS_LABELS } from '../core/models';

/** Shows content only when the user has the given permission. */
@Directive({ selector: '[appCan]' })
export class CanDirective {
  readonly appCan = input.required<string>();
  private readonly auth = inject(AuthService);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private shown = false;
  constructor() {
    effect(() => {
      const allowed = this.auth.permissions().has(this.appCan());
      if (allowed && !this.shown) { this.container.createEmbeddedView(this.template); this.shown = true; }
      if (!allowed && this.shown) { this.container.clear(); this.shown = false; }
    });
  }
}

/** Status badge component. */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge-' + variant()">{{ label() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<ApplicationStatus>();
  protected label() { return STATUS_LABELS[this.status()]; }
  protected variant() { return STATUS_BADGE[this.status()]; }
}

/** Simple pagination. */
@Component({
  selector: 'app-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (total() > pageSize()) {
      <div class="pager">
        <span>{{ from() }}–{{ to() }} of {{ total() }}</span>
        <button class="pager-btn" [disabled]="page() <= 1" (click)="prev()">‹ Prev</button>
        <button class="pager-btn" [disabled]="page() >= pages()" (click)="next()">Next ›</button>
      </div>
    }
  `,
})
export class Pager {
  readonly total = input(0);
  readonly page = input(1);
  readonly pageSize = input(25);
  @Output() readonly pageChange = new EventEmitter<number>();
  protected pages() { return Math.ceil(this.total() / this.pageSize()); }
  protected from() { return (this.page() - 1) * this.pageSize() + 1; }
  protected to() { return Math.min(this.page() * this.pageSize(), this.total()); }
  protected prev() { this.pageChange.emit(this.page() - 1); }
  protected next() { this.pageChange.emit(this.page() + 1); }
}
