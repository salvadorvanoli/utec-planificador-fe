import { ChangeDetectionStrategy, effect, Component, input, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, ActivatedRoute } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { Course, CourseBasicResponse } from '@app/core/models';
import { extractContextFromUrl, buildContextQueryParams } from '@app/shared/utils/context-encoder';

type NavigationMode = 'planner' | 'statistics' | 'info' | 'none';

@Component({
  selector: 'app-course-card',
  imports: [CheckboxModule, FormsModule, Skeleton],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'handleCardClick()'
  }
})
export class CourseCard {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  checked = signal(false);
  readonly assign = input<boolean>(false);
  readonly docente = input<boolean>(false);
  readonly course = input<Course | CourseBasicResponse | null>(null);
  readonly assignState = signal(this.assign());
  isLoading = signal(true);
  private navigationMode = signal<NavigationMode>('none');

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
    
    // Check if it's a CourseBasicResponse (teachers are UserBasicResponse[])
    if ('fullName' in teacher) {
      return teacher.fullName || teacher.email || 'Sin información';
    }
    
    // Otherwise it's a Course (teachers are Teacher[] with user property)
    if ('user' in teacher && teacher.user) {
      const { personalData, utecEmail } = teacher.user;
      if (personalData?.firstName && personalData?.lastName) {
        return `${personalData.firstName} ${personalData.lastName}`;
      }
      return utecEmail || 'Sin información';
    }

    return 'Sin docente asignado';
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

  shouldShowPdfIcon = () => this.navigationMode() === 'info';

  constructor() {
    effect(() => {
      this.assignState.set(this.assign());
    });

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];

      if (mode === 'planner') {
        this.navigationMode.set('planner');
      } else if (mode === 'statistics') {
        this.navigationMode.set('statistics');
      } else if (mode === 'info') {
        this.navigationMode.set('info');
      } else {
        const isDocente = this.docente();
        this.navigationMode.set(isDocente ? 'planner' : 'none');
      }
    });
  }

  handleCardClick(): void {
    const mode = this.navigationMode();
    const courseData = this.course();
    
    if (!courseData?.id) {
      console.warn('[CourseCard] No course ID available for navigation');
      return;
    }
    
    if (mode === 'planner') {
      this.router.navigate(['/planner', courseData.id]);
    } else if (mode === 'statistics') {
      this.router.navigate(['/statistics-page', courseData.id]);
    } else if (mode === 'info') {
      // TODO: Future implementation for 'info' mode can be added here
    }
  }

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500);
  }
}
