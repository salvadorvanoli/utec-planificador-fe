import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeeklyPlan } from '../planner/components/weekly-plan/weekly-plan';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { Titulo } from '@app/shared/components/titulo/titulo';
import { CourseInfo } from '@app/shared/components/course-info/course-info';
import { CourseService, PdfService } from '@app/core/services';
import { Course } from '@app/core/models';
import { Tooltip } from 'primeng/tooltip';
import { ChangeHistory } from '../planner/components/change-history/change-history';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';

@Component({
  selector: 'app-course-details',
  imports: [WeeklyPlan, SectionHeader, Titulo, CourseInfo, Tooltip, ChangeHistory, Toast, ConfirmDialog],
  providers: [MessageService, ConfirmationService],
  templateUrl: './course-details.html',
  styleUrl: './course-details.scss'
})
export class CourseDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly pdfService = inject(PdfService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly InfoType = InfoType;

  courseData = signal<Course | null>(null);
  isLoadingCourse = signal(true);
  showHistoryModal = signal(false);
  isGeneratingPdf = signal(false);

  ngOnInit(): void {
    // Extract courseId from encrypted queryParams
    this.route.queryParams.subscribe(params => {
      const context = extractContextFromUrl(params);
      const courseId = context?.courseId;

      if (courseId) {
        this.loadCourseData(courseId);
      } else {
        console.warn('[CourseDetails] No courseId found in encrypted context');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar el curso',
          life: 5000
        });
      }
    });
  }

  private loadCourseData(courseId: number): void {
    this.isLoadingCourse.set(true);

    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.courseData.set(course);
        this.isLoadingCourse.set(false);
      },
      error: (error) => {
        console.error('[CourseDetails] Error loading course:', error);
        this.isLoadingCourse.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del curso',
          life: 5000
        });
      }
    });
  }

  openHistoryModal(): void {
    this.showHistoryModal.set(true);
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
  }

  async downloadPdf(): Promise<void> {
    const courseId = this.courseData()?.id;

    if (!courseId) {
      console.error('[CourseDetails] No course ID available');
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar descarga de planificación',
      message: 'Se generará y descargará un archivo PDF con la planificación del curso. ¿Desea continuar?',
      icon: 'pi pi-file-pdf',
      acceptLabel: 'Descargar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        this.isGeneratingPdf.set(true);

        try {
          await this.pdfService.generateCoursePdf(courseId);
          this.messageService.add({
            severity: 'success',
            summary: 'PDF generado',
            detail: 'El PDF se ha generado exitosamente'
          });
        } catch (error) {
          console.error('[CourseDetails] Error generating PDF:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al generar el PDF. Por favor, intenta nuevamente.'
          });
        } finally {
          this.isGeneratingPdf.set(false);
        }
      }
    });
  }
}
