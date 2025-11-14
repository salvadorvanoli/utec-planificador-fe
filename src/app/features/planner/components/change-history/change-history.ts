import { Component, input, output, signal, effect, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DatePipe } from '@angular/common';
import { ModificationService } from '@app/core/services';
import { Modification } from '@app/core/models';

@Component({
  selector: 'app-change-history',
  imports: [Dialog, Paginator, DatePipe],
  templateUrl: './change-history.html',
  styleUrl: './change-history.scss'
})
export class ChangeHistory {
  private readonly modificationService = inject(ModificationService);

  visible = input.required<boolean>();
  courseId = input.required<number>();
  onClose = output<void>();

  // Datos de modificaciones
  modifications = signal<Modification[]>([]);
  totalElements = signal(0);
  isLoading = signal(false);

  // Paginación
  first = signal(0);
  rows = signal(10);

  constructor() {
    // Cargar datos cuando se abre el modal
    effect(() => {
      if (this.visible() && this.courseId()) {
        this.loadModifications();
      }
    });
  }

  private loadModifications(): void {
    this.isLoading.set(true);
    const page = Math.floor(this.first() / this.rows());

    this.modificationService.getCourseModifications(
      this.courseId(),
      page,
      this.rows()
    ).subscribe({
      next: (response) => {
        this.modifications.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading modifications:', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadModifications();
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.closeDialog();
    }
  }

  closeDialog(): void {
    this.onClose.emit();
  }
}
