import { ChangeDetectionStrategy, effect, Component, input, signal, inject, computed, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, ActivatedRoute } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Course, CourseBasicResponse } from '@app/core/models';
import { extractContextFromUrl, buildContextQueryParams } from '@app/shared/utils/context-encoder';
import { CourseService, PositionService, PdfService } from '@app/core/services';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-course-card',
  imports: [CheckboxModule, FormsModule, Skeleton, Dialog, ButtonModule, Toast],
  providers: [MessageService],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCard {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly positionService = inject(PositionService);
  private readonly messageService = inject(MessageService);
  private readonly pdfService = inject(PdfService);

  checked = signal(false);
  readonly assign = input<boolean>(false);
  readonly docente = input<boolean>(false);
  readonly course = input<Course | CourseBasicResponse | null>(null);
  readonly mode = input<'planner' | 'statistics' | 'info' | 'management' | null>(null);
  readonly assignState = signal(this.assign());
  isLoading = signal(true);
  readonly showDeleteModal = signal(false);
  readonly isDeletingCourse = signal(false);
  readonly isGeneratingPdf = signal(false);
  
  // Output para notificar al padre cuando se elimina un curso
  readonly onCourseDeleted = output<number>();

  readonly hasTeachers = computed(() => {
    const courseData = this.course();
    return courseData?.teachers !== undefined && courseData.teachers.length > 0;
  });

  readonly curricularUnitName = computed(() => {
    const courseData = this.course();
    if (!courseData) return 'Sin título';

    // Check if it's CourseBasicResponse (has curricularUnitName directly)
    if ('curricularUnitName' in courseData) {
      return courseData.curricularUnitName || 'Sin título';
    }

    // Otherwise it's a Course (has curricularUnit object)
    if ('curricularUnit' in courseData && courseData.curricularUnit) {
      return courseData.curricularUnit.name || 'Sin título';
    }

    return 'Sin título';
  });

  readonly teacherName = computed(() => {
    const courseData = this.course();
    if (!courseData?.teachers || courseData.teachers.length === 0) {
      return 'Sin docente asignado';
    }

    const teacher = courseData.teachers[0];
    
    // Both Course and CourseBasicResponse use UserBasicResponse[]
    if ('fullName' in teacher) {
      return teacher.fullName || teacher.email || 'Sin información';
    }

    return 'Sin docente asignado';
  });

  readonly shift = computed(() => {
    const courseData = this.course();
    if (!courseData) return null;
    return courseData.shift || null;
  });

  readonly termName = computed(() => {
    const courseData = this.course();
    if (!courseData) return null;
    
    // Check if it's CourseBasicResponse (has termName directly)
    if ('termName' in courseData) {
      return courseData.termName || null;
    }
    
    // Otherwise it's a Course - term information not directly available
    return null;
  });

  readonly programName = computed(() => {
    const courseData = this.course();
    if (!courseData) return null;
    
    // Check if it's CourseBasicResponse (has programName directly)
    if ('programName' in courseData) {
      return courseData.programName || null;
    }
    
    // Otherwise it's a Course - program information not directly available
    return null;
  });

  readonly dateRange = computed(() => {
    const courseData = this.course();
    if (!courseData) return null;

    const startDate = courseData.startDate;
    const endDate = courseData.endDate;

    if (!startDate || !endDate) return null;

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      
      const startFormatted = start.toLocaleDateString('es-UY', options);
      const endFormatted = end.toLocaleDateString('es-UY', options);
      
      return `${startFormatted} - ${endFormatted}`;
    } catch {
      return null;
    }
  });

  readonly formattedDate = computed(() => {
    const courseData = this.course();
    if (!courseData) return 'Sin fecha';

    // Check if it's CourseBasicResponse (has lastModificationDate)
    if ('lastModificationDate' in courseData) {
      const dateString = courseData.lastModificationDate;
      if (!dateString) return 'Sin modificaciones';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-UY', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return 'Fecha inválida';
      }
    }

    // Otherwise it's a Course (has startDate)
    if ('startDate' in courseData) {
      const dateString = courseData.startDate;
      if (!dateString) return 'Sin fecha';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-UY', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return 'Fecha inválida';
      }
    }

    return 'Sin fecha';
  });

  shouldShowPdfIcon = () => this.mode() === 'info';

  constructor() {
    effect(() => {
      this.assignState.set(this.assign());
    });
  }

  handleCardClick(): void {
    const mode = this.mode();
    
    // In management mode, disable card click - only buttons should work
    if (mode === 'management') {
      return;
    }

    const courseData = this.course();
    
    if (!courseData?.id) {
      console.warn('[CourseCard] No course ID available for navigation');
      return;
    }
    
    // Extract current context from URL to preserve it in navigation
    const currentParams = this.route.snapshot.queryParams;
    const contextParams = extractContextFromUrl(currentParams);
    
    if (!contextParams) {
      console.warn('[CourseCard] No context available for navigation');
      return;
    }
    
    // Build query params with context
    const queryParams = buildContextQueryParams({
      itrId: contextParams.itrId,
      campusId: contextParams.campusId
    });
    
    if (mode === 'planner') {
      this.router.navigate(['/planner', courseData.id], { queryParams });
    } else if (mode === 'statistics') {
      this.router.navigate(['/statistics-page', courseData.id], { queryParams });
    } else if (mode === 'info') {
      // Download PDF for the course
      this.downloadCoursePdf();
    }
  }

  async downloadCoursePdf(): Promise<void> {
    const courseData = this.course();
    
    if (!courseData?.id) {
      console.warn('[CourseCard] No course ID available for PDF download');
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudo obtener el ID del curso',
        life: 3000
      });
      return;
    }

    this.isGeneratingPdf.set(true);

    try {
      await this.pdfService.generateCoursePdf(courseData.id);
      console.log('[CourseCard] PDF generado exitosamente');
      this.messageService.add({
        severity: 'success',
        summary: 'PDF generado',
        detail: 'El PDF se ha descargado correctamente',
        life: 3000
      });
    } catch (error) {
      console.error('[CourseCard] Error al generar PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo generar el PDF. Por favor, intenta nuevamente.',
        life: 5000
      });
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }

  onEdit(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const courseData = this.course();
    if (!courseData?.id) {
      console.warn('[CourseCard] No course ID available for editing');
      return;
    }

    const context = this.positionService.selectedContext();
    if (!context) {
      console.warn('[CourseCard] No context available for editing');
      return;
    }

    const queryParams = buildContextQueryParams({
      itrId: context.itr.id,
      campusId: context.campus.id,
      isEdit: true,
      courseId: courseData.id
    });

    this.router.navigate(['/assign-page'], { queryParams });
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    if (this.isDeletingCourse()) {
      return;
    }

    const courseData = this.course();
    if (!courseData?.id) {
      console.warn('[CourseCard] No course ID available for deletion');
      return;
    }

    const courseId = courseData.id;
    this.isDeletingCourse.set(true);
    
    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Curso eliminado',
          detail: 'El curso se eliminó correctamente',
          life: 3000
        });
        this.showDeleteModal.set(false);
        this.isDeletingCourse.set(false);
        
        // Notificar al padre para que recargue la lista
        this.onCourseDeleted.emit(courseId);
      },
      error: (error) => {
        console.error('[CourseCard] Error deleting course:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo eliminar el curso',
          life: 5000
        });
        this.showDeleteModal.set(false);
        this.isDeletingCourse.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500);
  }
}
