import { ChangeDetectionStrategy, effect, Component, signal, input, inject, OnInit, computed } from '@angular/core';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { Selector, EnumOption } from '@app/shared/components/select/select'
import { ButtonComponent } from '@app/shared/components/button/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PositionService, CampusService, UserService, CourseService, FilterStateService, AuthService } from '@app/core/services';
import { PeriodResponse, Campus, UserBasicResponse } from '@app/core/models';
import { ActivatedRoute, Router } from '@angular/router';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';

@Component({
  selector: 'app-filter-panel',
  imports: [ColorBlock, Selector, ButtonComponent, CheckboxModule, FormsModule],
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
  private readonly mode = signal<'planner' | 'statistics' | 'info' | 'management' | null>(null);
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
    
    // Campus is permanent for statistics, planner and management modes
    if (currentMode === 'statistics' || currentMode === 'planner' || currentMode === 'management') {
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

  // Signals for authenticated user filter
  readonly showMyCoursesOnly = signal<boolean>(false);
  readonly authenticatedUserId = signal<number | null>(null);

  // Computed: determines if checkbox should be visible (only in statistics mode when authenticated)
  readonly shouldShowMyCoursesCheckbox = computed(() => {
    return this.mode() === 'statistics' && 
           this.authService.isAuthenticated() && 
           this.docente();
  });

  // Computed: determines if there are non-permanent filters active (for clear button state)
  readonly hasActiveFilters = computed(() => {
    // Include "My Courses" checkbox state in addition to other filters
    const hasServiceFilters = this.filterStateService.hasActiveNonPermanentFilters();
    const hasMyCoursesFilter = this.showMyCoursesOnly();
    return hasServiceFilters || hasMyCoursesFilter;
  });

  constructor() {
    // Detect if we're on the student/courses route
    const currentUrl = this.router.url;
    this.isStudentRoute.set(currentUrl.includes('/student/courses'));
    
    // Subscribe to route query params to get the mode from encrypted context
    this.route.queryParams.subscribe(query => {
      const context = extractContextFromUrl(query);
      const mode = context?.mode;
      
      if (mode === 'planner' || mode === 'statistics' || mode === 'info' || mode === 'management') {
        this.mode.set(mode);
      } else {
        this.mode.set(null);
      }
    });

    effect(() => {
      this.docenteState.set(this.docente());
    });

    // Effect para cargar períodos cuando cambia el contexto o el checkbox "Mis cursos"
    effect(() => {
      const context = this.positionService.selectedContext();
      const isDocente = this.docente();
      
      if (isDocente && context?.campus) {
        // Para docentes autenticados: cargar períodos del campus
        // Si "Mis cursos" está marcado, filtrar por userId
        const userId = this.showMyCoursesOnly() ? this.authenticatedUserId() : null;
        this.loadPeriods(context.campus.id, userId);
      } else if (!isDocente) {
        // Para usuarios no autenticados: cargar todos los períodos (sin parámetros)
        this.loadPeriods();
      } else {
        this.periods.set([]);
        this.periodsOptions.set([]);
      }
    }, { allowSignalWrites: true });

    // Effect para actualizar teachers cuando cambia campus o período
    effect(() => {
      const campusId = this.selectedCampusId();
      const period = this.selectedPeriod();
      
      if (!this.docente() && campusId !== null) {
        this.loadTeachers(campusId, period);
      }
    }, { allowSignalWrites: true });

    // Effect para actualizar campuses cuando cambia teacher o período
    effect(() => {
      const teacherId = this.selectedTeacherId();
      const period = this.selectedPeriod();
      
      if (!this.docente() && teacherId !== null) {
        this.loadCampuses(teacherId, period);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const context = this.positionService.selectedContext();
    
    // Set authenticated user ID from position service
    const userPositions = this.positionService.userPositions();
    if (userPositions?.userId) {
      this.authenticatedUserId.set(userPositions.userId);
      console.log('[FilterPanel] Authenticated user ID set:', userPositions.userId);
    }
    
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
    
    // Load periods based on context
    if (context?.campus && this.docente()) {
      this.loadPeriods(context.campus.id);
    } else if (!this.docente()) {
      this.loadPeriods(); // Sin parámetros = todos los períodos
    }

    // Load initial campuses and teachers for non-authenticated users
    if (!this.docente()) {
      this.loadCampuses();
      this.loadTeachers();
    }
  }

  private loadPeriods(campusId?: number, userId?: number | null): void {
    this.isLoadingPeriods.set(true);
    
    this.courseService.getPeriods(campusId, userId ?? undefined).subscribe({
      next: (periods) => {
        this.periods.set(periods);
        this.periodsOptions.set(
          periods.map(p => ({
            value: p.period,
            displayValue: p.period
          }))
        );
        
        // Validate current selection: clear if not in the new list
        const currentPeriod = this.selectedPeriod();
        if (currentPeriod !== null && !periods.some(p => p.period === currentPeriod)) {
          console.log('[FilterPanel] Current period not in filtered list, clearing selection');
          this.selectedPeriod.set(null);
          this.filterStateService.setPeriod(undefined);
        }
        
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
    
    // Cuando cambia el período, actualizar los demás filtros si no es docente
    if (!this.docente()) {
      // Recargar campuses con el nuevo período si hay un teacher seleccionado
      const teacherId = this.selectedTeacherId();
      if (teacherId) {
        this.loadCampuses(teacherId, period);
      } else {
        this.loadCampuses(undefined, period);
      }
      
      // Recargar teachers con el nuevo período si hay un campus seleccionado
      const campusId = this.selectedCampusId();
      if (campusId) {
        this.loadTeachers(campusId, period);
      } else {
        this.loadTeachers(undefined, period);
      }
    }
  }

  private loadCampuses(teacherId?: number, period?: string | null): void {
    this.isLoadingCampuses.set(true);
    
    this.campusService.getCampuses(teacherId, period ?? undefined).subscribe({
      next: (campuses) => {
        this.campuses.set(campuses);
        this.campusOptions.set(
          campuses.map(campus => ({
            value: campus.id.toString(),
            displayValue: campus.name
          }))
        );
        
        // Validate current selection: clear if not in the new list
        const currentCampusId = this.selectedCampusId();
        if (currentCampusId !== null && !campuses.some(c => c.id === currentCampusId)) {
          console.log('[FilterPanel] Current campus not in filtered list, clearing selection');
          this.selectedCampusId.set(null);
          this.filterStateService.setCampusId(undefined);
        }
        
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

  private loadTeachers(campusId?: number, period?: string | null): void {
    this.isLoadingTeachers.set(true);
    
    this.userService.getTeachers(campusId, period ?? undefined).subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.teacherOptions.set(
          teachers.map(teacher => ({
            value: teacher.id.toString(),
            displayValue: teacher.fullName || teacher.email
          }))
        );
        
        // Validate current selection: clear if not in the new list
        const currentTeacherId = this.selectedTeacherId();
        if (currentTeacherId !== null && !teachers.some(t => t.id === currentTeacherId)) {
          console.log('[FilterPanel] Current teacher not in filtered list, clearing selection');
          this.selectedTeacherId.set(null);
          this.filterStateService.setUserId(undefined);
        }
        
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
    
    // Reload dependent filters
    const period = this.selectedPeriod();
    const teacherId = this.selectedTeacherId();
    
    this.loadTeachers(id, period);
    
    // Reload periods filtered by campus and teacher (if selected)
    if (!this.docente()) {
      this.loadPeriods(id, teacherId ?? undefined);
    }
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
    
    // Reload dependent filters
    const period = this.selectedPeriod();
    const campusId = this.selectedCampusId();
    
    this.loadCampuses(id, period);
    
    // Reload periods filtered by teacher and campus (if selected)
    if (!this.docente()) {
      this.loadPeriods(campusId ?? undefined, id);
    }
  }

  onMyCoursesCheckboxChange(checked: boolean): void {
    this.showMyCoursesOnly.set(checked);
    
    // Update filter state service with userId filter
    if (checked && this.authenticatedUserId()) {
      this.filterStateService.setUserId(this.authenticatedUserId()!);
      console.log('[FilterPanel] Filtering by authenticated user:', this.authenticatedUserId());
    } else {
      // Clear userId filter if unchecked
      const permanentUserId = this.filterStateService.permanentFilters().userId;
      if (permanentUserId) {
        // Restore permanent userId if exists
        this.filterStateService.setUserId(permanentUserId);
      } else {
        this.filterStateService.setUserId(undefined);
      }
      console.log('[FilterPanel] Removed authenticated user filter');
    }
    
    // Note: Periods are automatically reloaded by the effect that watches showMyCoursesOnly()
    // The effect calls loadPeriods() which includes validation and will clear the period
    // selection only if it's not available in the new filtered list
    // This avoids duplicate loadPeriods() calls and potential race conditions
  }

  clearFilters(): void {
    // Clear non-permanent filters
    this.filterStateService.clearFilters();
    
    // Reset period selection (never permanent)
    this.selectedPeriod.set(null);
    
    // Reset my courses checkbox
    this.showMyCoursesOnly.set(false);
    
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
    // Note: For authenticated teachers, periods are automatically reloaded by the effect
    // that watches showMyCoursesOnly() - no need to call loadPeriods() here
    if (!this.docente()) {
      // Para usuario no autenticado: recargar períodos y filtros
      this.loadPeriods(); // Sin parámetros = todos los períodos
      
      // Recargar opciones solo si no son permanentes
      if (!this.isCampusPermanent()) {
        this.loadCampuses();
      }
      if (!this.isTeacherPermanent()) {
        this.loadTeachers();
      }
    }
    // For authenticated teachers: the effect watching showMyCoursesOnly() will handle period reload
    
    console.log('[FilterPanel] Non-permanent filters cleared, permanent filters preserved');
  }
}
