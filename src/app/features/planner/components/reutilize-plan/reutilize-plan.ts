import { ChangeDetectionStrategy, Component, input, output, signal, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Selector } from '@app/shared/components/select/select';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reutilize-plan',
  imports: [Dialog, Selector],
  providers: [MessageService],
  templateUrl: './reutilize-plan.html',
  styleUrl: './reutilize-plan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReutilizePlan {
  readonly visible = input<boolean>(false);
  readonly courses = input<any[]>([]);
  readonly isLoading = input<boolean>(false);
  
  readonly onClose = output<void>();
  readonly onConfirm = output<string>();
  
  readonly selectedCourse = signal<string>('');

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.closeModal();
    }
  }

  handleCourseChange(courseId: string): void {
    this.selectedCourse.set(courseId);
  }

  closeModal(): void {
    this.selectedCourse.set('');
    this.onClose.emit();
  }

  confirmSelection(): void {
    const courseId = this.selectedCourse();
    if (courseId) {
      this.onConfirm.emit(courseId);
      this.closeModal();
    }
  }
}
