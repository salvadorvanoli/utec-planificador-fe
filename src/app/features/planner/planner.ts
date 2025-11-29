import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WeeklyPlan } from './components/weekly-plan/weekly-plan';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { Titulo } from '@app/shared/components/titulo/titulo';
import { CourseInfo } from '@app/shared/components/course-info/course-info';
import { CourseService, PdfService, PositionService } from '@app/core/services';
import { Course } from '@app/core/models';
import { Tooltip } from 'primeng/tooltip';
import { ChangeHistory } from './components/change-history/change-history';
import { ReutilizePlan } from './components/reutilize-plan/reutilize-plan';
import { EnumOption } from '@app/shared/components/select/select';

@Component({
  selector: 'app-planner',
  imports: [WeeklyPlan, SectionHeader, Titulo, CourseInfo, Tooltip, ChangeHistory, ReutilizePlan],
  templateUrl: './planner.html',
  styleUrl: './planner.scss'
})
export class Planner implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly pdfService = inject(PdfService);
  private readonly router = inject(Router);
  private readonly positionService = inject(PositionService);
  
  readonly InfoType = InfoType;
  
  courseData = signal<Course | null>(null);
  isLoadingCourse = signal(true);
  showHistoryModal = signal(false);
  showReutilizeModal = signal(false);
  isGeneratingPdf = signal(false);
  pastCourses = signal<EnumOption[]>([]);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    
    if (courseId) {
      this.loadCourseData(+courseId);
    }
  }

  private loadCourseData(courseId: number): void {
    this.isLoadingCourse.set(true);
    
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.courseData.set(course);
        this.isLoadingCourse.set(false);
        this.loadPastCourses(course);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoadingCourse.set(false);
      }
    });
  }

  private loadPastCourses(course: Course): void {
    console.log('[Planner] ==================== START loadPastCourses ====================');
    console.log('[Planner] Full course object:', course);
    
    // Obtener userId desde userPositions
    let userPositions = this.positionService.userPositions();
    
    // Si no hay userPositions, cargarlas primero
    if (!userPositions) {
      console.log('[Planner] No userPositions found, loading them first...');
      this.positionService.getUserPositions().subscribe({
        next: (positions) => {
          console.log('[Planner] UserPositions loaded:', positions);
          this.loadPastCoursesWithData(course, positions.userId);
        },
        error: (error) => {
          console.error('[Planner] Error loading user positions:', error);
        }
      });
      return;
    }
    
    this.loadPastCoursesWithData(course, userPositions.userId);
  }

  private loadPastCoursesWithData(course: Course, userId: number): void {
    // El backend devuelve curricularUnitId directamente, no como objeto anidado
    const curricularUnitId = (course as any).curricularUnitId || course?.curricularUnit?.id;

    console.log('[Planner] Final extracted IDs:', { userId, curricularUnitId });

    if (!userId) {
      console.warn('[Planner] Cannot load past courses - missing userId');
      return;
    }

    if (!curricularUnitId) {
      console.warn('[Planner] Cannot load past courses - missing curricularUnitId');
      return;
    }

    console.log('[Planner] Loading past courses for:', { userId, curricularUnitId });

    this.courseService.getTeacherPastCourses(userId, curricularUnitId).subscribe({
      next: (courses) => {
        console.log('[Planner] Received past courses:', courses);
        console.log('[Planner] Number of courses received:', courses.length);
        
        if (courses.length > 0) {
          console.log('[Planner] First course structure:', courses[0]);
        }
        
        // El backend devuelve courseId, no id
        // Filtrar el curso actual usando courseId
        const filteredCourses = courses.filter(c => {
          if (!c || !c.courseId) {
            console.warn('[Planner] Course without courseId found:', c);
            return false;
          }
          return c.courseId !== course.id;
        });
        
        console.log('[Planner] Filtered courses:', filteredCourses);
        
        // Convertir a EnumOption para el select usando displayName que ya viene formateado
        const options: EnumOption[] = filteredCourses.map(c => ({
          value: c.courseId.toString(),
          displayValue: c.displayName || `${c.curricularUnitName} - ${c.period}`
        }));
        
        this.pastCourses.set(options);
        console.log('[Planner] Past courses loaded as options:', options);
      },
      error: (error) => {
        console.error('[Planner] Error loading past courses:', error);
        console.error('[Planner] Error details:', JSON.stringify(error, null, 2));
        this.pastCourses.set([]);
      }
    });
  }

  handleCourseUpdate(updatedCourse: Course): void {
    this.courseData.set(updatedCourse);
  }

  openHistoryModal(): void {
    this.showHistoryModal.set(true);
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
  }

  openReutilizeModal(): void {
    this.showReutilizeModal.set(true);
  }

  closeReutilizeModal(): void {
    this.showReutilizeModal.set(false);
  }

  handleReutilizeConfirm(courseId: string): void {
    console.log('Reutilizar planificación del curso:', courseId);
    // TODO: Implementar la lógica para reutilizar la planificación
  }

  async downloadPdf(): Promise<void> {
    const courseId = this.courseData()?.id;
    
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    this.isGeneratingPdf.set(true);

    try {
      await this.pdfService.generateCoursePdf(courseId);
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }
}
