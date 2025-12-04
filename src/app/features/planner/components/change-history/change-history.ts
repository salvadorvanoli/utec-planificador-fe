import { Component, input, output, signal, effect, inject, computed } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DatePipe } from '@angular/common';
import { ModificationService } from '@app/core/services';
import { Modification, ModificationType } from '@app/core/models';

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
  courseStartDate = input.required<string>(); // formato YYYY-MM-DD
  onClose = output<void>();

  // Datos de modificaciones
  modifications = signal<Modification[]>([]);
  totalElements = signal(0);
  isLoading = signal(false);

  // Paginación
  first = signal(0);
  rows = signal(10);

  // Set of modification IDs that are post-start (computed for performance)
  postStartModificationIds = computed(() => {
    const startDate = new Date(this.courseStartDate());
    startDate.setHours(0, 0, 0, 0);

    return new Set(
      this.modifications()
        .filter(mod => {
          const modificationDate = new Date(mod.modificationDate);
          modificationDate.setHours(0, 0, 0, 0);
          return modificationDate >= startDate;
        })
        .map(mod => mod.id)
    );
  });

  // Computed para modificaciones con estilos precalculados
  modificationsWithStyles = computed(() => {
    return this.modifications().map(mod => ({
      ...mod,
      icon: this.getModificationIconInternal(mod.type),
      color: this.getModificationColorInternal(mod.type),
      bgColor: this.getModificationBgColorInternal(mod.type)
    }));
  });

  constructor() {
    // Cargar datos cuando se abre el modal
    effect(() => {
      if (this.visible() && this.courseId()) {
        this.loadModifications();
      }
    });
  }

  private getModificationIconInternal(type: ModificationType): string {
    const icons = {
      'CREATE': 'pi-plus-circle',
      'UPDATE': 'pi-pen-to-square',
      'DELETE': 'pi-trash'
    };
    return icons[type] || 'pi-history';
  }

  private getModificationColorInternal(type: ModificationType): string {
    const colors = {
      'CREATE': 'text-green-600',
      'UPDATE': 'text-yellow-600',
      'DELETE': 'text-red-600'
    };
    return colors[type] || 'text-[#00A9E0]';
  }

  private getModificationBgColorInternal(type: ModificationType): string {
    const bgColors = {
      'CREATE': 'bg-green-100',
      'UPDATE': 'bg-yellow-100',
      'DELETE': 'bg-red-100'
    };
    return bgColors[type] || 'bg-[#00A9E0]/20';
  }

  isPostStartModification(modificationId: number): boolean {
    return this.postStartModificationIds().has(modificationId);
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
