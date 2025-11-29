import { Component, effect, inject, input, signal } from '@angular/core';
import { CourseCard } from '../../../../shared/components/course-card/course-card';
import { Searchbar } from '../../../../shared/components/searchbar/searchbar';
import { Paginator } from '../../../../shared/components/paginator/paginator';
import { CourseService, FilterStateService, AuthService, PositionService } from '@app/core/services';
import { CourseBasicResponse } from '@app/core/models';
import { PaginatorState } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { Router, ActivatedRoute } from '@angular/router';
import { buildContextQueryParams } from '@app/shared/utils/context-encoder';

@Component({
  selector: 'app-content-panel',
  imports: [CourseCard, Searchbar, Paginator, Skeleton],
  templateUrl: './content-panel.html',
  styleUrl: './content-panel.scss'
})
export class ContentPanel {
  private readonly courseService = inject(CourseService);
  private readonly filterStateService = inject(FilterStateService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly positionService = inject(PositionService);

  readonly docente = input<boolean>(false);
  readonly mode = input<'planner' | 'statistics' | 'info' | 'management' | null>(null);
  
  readonly courses = signal<CourseBasicResponse[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filters = this.filterStateService.filters();
      console.log('[ContentPanel] Filters changed:', filters);
      // Resetear a la primera página cuando cambian los filtros
      this.currentPage.set(0);
      this.loadCourses();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    // Validate permanent filters before loading courses
    if (this.filterStateService.hasPermanentFilters()) {
      const isValid = this.filterStateService.validatePermanentFilters();
      if (!isValid) {
        console.error('[ContentPanel] SECURITY VIOLATION: Permanent filters validation failed. Logging out user.');
        this.authService.logout();
        return;
      }
    }

    this.isLoading.set(true);
    
    const filters = this.filterStateService.filters();
    const page = this.currentPage();
    const size = this.pageSize();

    console.log('[ContentPanel] Loading courses with:', { filters, page, size });

    this.courseService.getCourses(
      filters.userId,
      filters.campusId,
      filters.period,
      filters.searchText,
      page,
      size
    ).subscribe({
      next: (response) => {
        console.log('[ContentPanel] Courses loaded:', response);
        this.courses.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[ContentPanel] Error loading courses:', error);
        this.courses.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: PaginatorState): void {
    console.log('[ContentPanel] Page change event:', event);
    this.currentPage.set(event.page ?? 0);
    this.pageSize.set(event.rows ?? 10);
    this.loadCourses();
  }

  onCreateCourse(): void {
    const context = this.positionService.selectedContext();
    if (!context) {
      console.warn('[ContentPanel] No context available for creating course');
      return;
    }

    const queryParams = buildContextQueryParams({
      itrId: context.itr.id,
      campusId: context.campus.id,
      isEdit: false
    });

    this.router.navigate(['/assign-page'], { queryParams });
  }
}
