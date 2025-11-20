import { ChangeDetectionStrategy, effect, Component, signal, input, inject, OnInit, computed } from '@angular/core';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { Selector, EnumOption } from '@app/shared/components/select/select'
import { ButtonComponent } from '@app/shared/components/button/button';
import { PositionService, CampusService, UserService, CourseService, FilterStateService, AuthService } from '@app/core/services';
import { PeriodResponse, Campus, UserBasicResponse } from '@app/core/models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filter-panel',
  imports: [ColorBlock, Selector, ButtonComponent],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterPanel implements OnInit {
  private readonly positionService = inject(PositionService);
  private readonly campusService = inject(CampusService);
  private readonly userService = inject(UserService);
  private readonly courseService = inject(CourseService);
  private readonly filterStateService = inject(FilterStateService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly docente = input<boolean>(false);
  readonly docenteState = signal<boolean>(false);
  private readonly mode = signal<'planner' | 'statistics' | 'info' | null>(null);
  private readonly isStudentRoute = signal<boolean>(false);

  // Computed: determines if campus filter is permanent (cannot be modified)
  readonly isCampusPermanent = computed(() => {
    const currentMode = this.mode();
    const isAuthenticated = this.authService.isAuthenticated();
    const isStudent = this.isStudentRoute();
    
    // Never permanent on student/courses route
    if (isStudent) {
      return false;
    }
    
    // Campus is permanent for statistics and planner modes
    if (currentMode === 'statistics' || currentMode === 'planner') {
      return true;
    }
    
    // Campus is permanent for info mode only if user is authenticated (on course-catalog route)
    if (currentMode === 'info' && isAuthenticated) {
      return true;
    }
    
    return false;
  });

  // Computed: determines if teacher filter is permanent (cannot be modified)
  readonly isTeacherPermanent = computed(() => {
    return this.mode() === 'planner' && this.docente();
  });

  readonly periods = signal<PeriodResponse[]>([]);
  readonly periodsOptions = signal<EnumOption[]>([]);
  readonly selectedPeriod = signal<string | null>(null);
  readonly isLoadingPeriods = signal<boolean>(false);

  readonly campuses = signal<Campus[]>([]);
  readonly campusOptions = signal<EnumOption[]>([]);
  readonly selectedCampusId = signal<number | null>(null);
  readonly isLoadingCampuses = signal<boolean>(false);

  readonly teachers = signal<UserBasicResponse[]>([]);
  readonly teacherOptions = signal<EnumOption[]>([]);
  readonly selectedTeacherId = signal<number | null>(null);
  readonly isLoadingTeachers = signal<boolean>(false);

  // Computed: determines if there are non-permanent filters active (for clear button state)
  readonly hasActiveFilters = computed(() => this.filterStateService.hasActiveNonPermanentFilters());

  constructor() {
    // Detect if we're on the student/courses route
    const currentUrl = this.router.url;
    this.isStudentRoute.set(currentUrl.includes('/student/courses'));
    
    // Subscribe to route query params to get the mode
    this.route.queryParams.subscribe(query => {
      const mode = query['mode'];
      if (mode === 'planner' || mode === 'statistics' || mode === 'info') {
        this.mode.set(mode);
      } else {
        this.mode.set(null);
      }
    });

    effect(() => {
      this.docenteState.set(this.docente());
    });

    effect(() => {
      const context = this.positionService.selectedContext();
      if (context?.campus && this.docente()) {
        this.loadPeriods(context.campus.id);
      } else {
        this.periods.set([]);
        this.periodsOptions.set([]);
      }
    });

    effect(() => {
      const campusId = this.selectedCampusId();
      if (!this.docente() && campusId !== null) {
        this.loadTeachers(campusId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const context = this.positionService.selectedContext();
    
    // Check if there are permanent filters to set initial values
    const permanentFilters = this.filterStateService.permanentFilters();
    
    // Set initial campus selection if it's a permanent filter
    if (permanentFilters.campusId) {
      this.selectedCampusId.set(permanentFilters.campusId);
      console.log('[FilterPanel] Initial permanent campus filter set:', permanentFilters.campusId);
    }
    
    // Set initial teacher selection if it's a permanent filter
    if (permanentFilters.userId) {
      this.selectedTeacherId.set(permanentFilters.userId);
      console.log('[FilterPanel] Initial permanent teacher filter set:', permanentFilters.userId);
    }
    
    if (context?.campus && this.docente()) {
      this.loadPeriods(context.campus.id);
    }

    if (!this.docente()) {
      this.loadCampuses();
      this.loadTeachers();
    }
  }

  private loadPeriods(campusId: number): void {
    this.isLoadingPeriods.set(true);
    
    this.courseService.getPeriodsByCampus(campusId).subscribe({
      next: (periods) => {
        this.periods.set(periods);
        this.periodsOptions.set(
          periods.map(p => ({
            value: p.period,
            displayValue: p.period
          }))
        );
        this.isLoadingPeriods.set(false);
      },
      error: (error) => {
        console.error('Error loading periods:', error);
        this.periods.set([]);
        this.periodsOptions.set([]);
        this.isLoadingPeriods.set(false);
      }
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod.set(period);
    this.filterStateService.setPeriod(period);
    console.log('Period selected:', period);
  }

  private loadCampuses(teacherId?: number): void {
    this.isLoadingCampuses.set(true);
    
    this.campusService.getCampuses(teacherId).subscribe({
      next: (campuses) => {
        this.campuses.set(campuses);
        this.campusOptions.set(
          campuses.map(campus => ({
            value: campus.id.toString(),
            displayValue: campus.name
          }))
        );
        this.isLoadingCampuses.set(false);
      },
      error: (error) => {
        console.error('Error loading campuses:', error);
        this.campuses.set([]);
        this.campusOptions.set([]);
        this.isLoadingCampuses.set(false);
      }
    });
  }

  private loadTeachers(campusId?: number): void {
    this.isLoadingTeachers.set(true);
    
    this.userService.getTeachers(campusId).subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.teacherOptions.set(
          teachers.map(teacher => ({
            value: teacher.id.toString(),
            displayValue: teacher.fullName || teacher.email
          }))
        );
        this.isLoadingTeachers.set(false);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.teachers.set([]);
        this.teacherOptions.set([]);
        this.isLoadingTeachers.set(false);
      }
    });
  }

  onCampusChange(campusId: string): void {
    // Security check: prevent modification of permanent campus filter
    if (this.isCampusPermanent()) {
      console.error('[FilterPanel] SECURITY VIOLATION: Attempt to modify permanent campus filter. Logging out user.');
      this.authService.logout();
      return;
    }

    const id = parseInt(campusId, 10);
    this.selectedCampusId.set(id);
    this.filterStateService.setCampusId(id);
    console.log('Campus selected:', id);
    
    this.loadTeachers(id);
  }

  onTeacherChange(teacherId: string): void {
    // Security check: prevent modification of permanent teacher filter
    if (this.isTeacherPermanent()) {
      console.error('[FilterPanel] SECURITY VIOLATION: Attempt to modify permanent teacher filter. Logging out user.');
      this.authService.logout();
      return;
    }

    const id = parseInt(teacherId, 10);
    this.selectedTeacherId.set(id);
    this.filterStateService.setUserId(id);
    console.log('Teacher selected:', id);
    
    this.loadCampuses(id);
  }

  clearFilters(): void {
    // Clear non-permanent filters
    this.filterStateService.clearFilters();
    
    // Reset period selection (never permanent)
    this.selectedPeriod.set(null);
    
    // For non-permanent filters, reset selections
    if (!this.isCampusPermanent()) {
      this.selectedCampusId.set(null);
    } else {
      // Keep permanent campus filter visible
      const permFilters = this.filterStateService.permanentFilters();
      if (permFilters.campusId) {
        this.selectedCampusId.set(permFilters.campusId);
      }
    }
    
    if (!this.isTeacherPermanent()) {
      this.selectedTeacherId.set(null);
    } else {
      // Keep permanent teacher filter visible
      const permFilters = this.filterStateService.permanentFilters();
      if (permFilters.userId) {
        this.selectedTeacherId.set(permFilters.userId);
      }
    }
    
    // Reload options for non-permanent filters
    if (this.docente()) {
      // Para docente: recargar todos los periodos
      const context = this.positionService.selectedContext();
      if (context?.campus) {
        this.loadPeriods(context.campus.id);
      }
    } else {
      // Para alumno: recargar opciones solo si no son permanentes
      if (!this.isCampusPermanent()) {
        this.loadCampuses();
      }
      if (!this.isTeacherPermanent()) {
        this.loadTeachers();
      }
    }
    
    console.log('[FilterPanel] Non-permanent filters cleared, permanent filters preserved');
  }
}
