import { ChangeDetectionStrategy, effect, Component, input, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, ActivatedRoute } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { Course } from '@app/core/models';

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
  readonly course = input<Course | null>(null);
  readonly assignState = signal(this.assign());
  isLoading = signal(true);
  private navigationMode = signal<NavigationMode>('none');

  readonly hasTeachers = computed(() => {
    const courseData = this.course();
    return courseData?.teachers !== undefined && courseData.teachers.length > 0;
  });

  readonly teacherName = computed(() => {
    const courseData = this.course();
    if (!courseData?.teachers || courseData.teachers.length === 0) {
      return 'Sin docente asignado';
    }

    const teacher = courseData.teachers[0];
    if (!teacher?.user) {
      return 'Sin docente asignado';
    }

    const { personalData, utecEmail } = teacher.user;
    
    if (personalData?.firstName && personalData?.lastName) {
      return `${personalData.firstName} ${personalData.lastName}`;
    }
    
    return utecEmail || 'Sin información';
  });

  readonly formattedDate = computed(() => {
    const dateString = this.course()?.startDate;
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
    
    if (mode === 'planner') {
      this.router.navigate(['/planner']);
    } else if (mode === 'statistics') {
      this.router.navigate(['/statistics-page']);
    }
  }

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500);
  }
}