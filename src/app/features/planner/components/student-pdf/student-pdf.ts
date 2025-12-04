import { Component, effect, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '@app/core/services';
import { CoursePdfData } from '@app/core/models';

@Component({
  selector: 'app-student-pdf',
  imports: [CommonModule],
  templateUrl: './student-pdf.html',
  styleUrls: ['./student-pdf.scss']
})
export class StudentPdfComponent {
  private readonly courseService = inject(CourseService);

  // Input: ID del curso
  courseId = input.required<number>();

  // Signals para los datos del curso
  courseData = signal<CoursePdfData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed signals para formateo eficiente
  teacherName = computed(() => {
    const teachers = this.courseData()?.teachers;
    if (!teachers || teachers.length === 0) return 'No asignado';
    const teacher = teachers[0];
    return `${teacher.name} ${teacher.lastName}`;
  });

  careerName = computed(() => this.courseData()?.programName || 'No especificada');

  formattedWeeks = computed(() => {
    const weeks = this.courseData()?.weeklyPlannings || [];
    return weeks.map(week => ({
      ...week,
      formattedStartDate: this.formatDateInternal(week.startDate),
      formattedEndDate: this.formatDateInternal(week.endDate)
    }));
  });

  hoursByFormat = computed(() => {
    const course = this.courseData();
    if (!course?.hoursPerDeliveryFormat) {
      return { VIRTUAL: 0, ONLINE: 0, PRESENTIAL: 0 };
    }
    return {
      VIRTUAL: course.hoursPerDeliveryFormat['VIRTUAL'] || 0,
      ONLINE: course.hoursPerDeliveryFormat['ONLINE'] || 0,
      PRESENTIAL: course.hoursPerDeliveryFormat['PRESENTIAL'] || 0
    };
  });

  formattedStartDate = computed(() => this.formatDateInternal(this.courseData()?.startDate));
  
  formattedEndDate = computed(() => this.formatDateInternal(this.courseData()?.endDate));

  productiveSectorLabel = computed(() => 
    this.getBooleanLabelInternal(this.courseData()?.involvesActivitiesWithProductiveSector)
  );

  investigationLabel = computed(() => 
    this.getBooleanLabelInternal(this.courseData()?.isRelatedToInvestigation)
  );

  gradingSystemLabel = computed(() => this.getGradingSystemLabelInternal(this.courseData()?.partialGradingSystem));

  shiftLabel = computed(() => this.getShiftLabelInternal(this.courseData()?.shift));

  constructor() {
    // Efecto que carga los datos cuando cambia el courseId
    effect(() => {
      const id = this.courseId();
      if (id) {
        this.loadCourseData(id);
      }
    });
  }

  private loadCourseData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.courseService.getCoursePdfData(id).subscribe({
      next: (pdfData) => {
        console.log('[StudentPdfComponent] PDF data loaded:', pdfData);
        this.courseData.set(pdfData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[StudentPdfComponent] Error loading PDF data:', err);
        this.error.set('Error al cargar los datos del curso');
        this.isLoading.set(false);
      }
    });
  }

  // Helpers privados para formateo (usados por computed)
  private formatDateInternal(date: string | undefined): string {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Métodos privados para formateo (usados por computed)
  private getShiftLabelInternal(shift: string | undefined): string {
    const shifts: { [key: string]: string } = {
      'MORNING': 'Matutino',
      'AFTERNOON': 'Vespertino',
      'NIGHT': 'Nocturno',
      'FULL_TIME': 'Tiempo completo'
    };
    return shift ? shifts[shift] || shift : 'No especificado';
  }

  private getGradingSystemLabelInternal(system: string | undefined): string {
    const systems: { [key: string]: string } = {
      'NUMERIC': 'Numérico',
      'LETTER': 'Por letras',
      'PASS_FAIL': 'Aprobado/Reprobado'
    };
    return system ? systems[system] || system : 'No especificado';
  }

  private getBooleanLabelInternal(value: boolean | undefined): string {
    if (value === undefined || value === null) return 'No especificado';
    return value ? 'Sí' : 'No';
  }
}
