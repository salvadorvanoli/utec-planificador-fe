import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed, effect } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { FilterPanel} from '@app/features/course-catalog/component/filter-panel/filter-panel';
import { ContentPanel } from '@app/features/course-catalog/component/content-panel/content-panel';
import { InfoType } from '@app/core/enums/info';
import { Role } from '@app/core/enums/role';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterStateService, PositionService, AuthService } from '@app/core/services';

@Component({
  selector: 'app-course-catalog',
  imports: [SectionHeader, FilterPanel, ContentPanel],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCatalog implements OnInit {
  readonly InfoType = InfoType;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly filterStateService = inject(FilterStateService);
  private readonly positionService = inject(PositionService);
  private readonly authService = inject(AuthService);
  
  private readonly mode = signal<'planner' | 'statistics' | 'info' | null>(null);
  private readonly isStudentRoute = signal<boolean>(false);
  
  // Computed: verificy if the user has the TEACHER role in the current context
  readonly isTeacher = computed(() => {
    const context = this.positionService.selectedContext();
    return (context?.roles?.includes(Role.TEACHER) && !this.isStudentRoute()) ?? false;
  });
  
  // Computed: determines if it should filter by teacher (planner mode + is teacher)
  readonly shouldFilterByTeacher = computed(() => {
    return this.mode() === 'planner' && this.isTeacher();
  });

  // Computed: determines if campus filter should be permanent
  readonly shouldFilterByCampus = computed(() => {
    const currentMode = this.mode();
    const isAuthenticated = this.authService.isAuthenticated();
    const isStudent = this.isStudentRoute();
    
    // No permanent filters on student/courses route (public access)
    if (isStudent) {
      return false;
    }
    
    // No permanent filters when mode is not specified
    if (!currentMode) {
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

  constructor() {
    // Detect if we're on the student/courses route (public access)
    const currentUrl = this.router.url;
    this.isStudentRoute.set(currentUrl.includes('/student/courses'));
    console.log('[CourseCatalog] Is student route:', this.isStudentRoute());

    this.route.queryParams.subscribe(query => {
      console.log('[CourseCatalog] Query params:', query);
      
      // Set mode from query params
      const mode = query['mode'];
      if (mode === 'planner' || mode === 'statistics' || mode === 'info') {
        this.mode.set(mode);
      } else {
        this.mode.set(null);
      }
    });

    // Effect to monitor filter tampering (only when NOT on student route)
    effect(() => {
      const isStudent = this.isStudentRoute();
      const currentMode = this.mode();
      const hasPermanent = this.filterStateService.hasPermanentFilters();
      
      // Skip validation on student/courses route (public access, no permanent filters)
      if (isStudent) {
        return;
      }
      
      // Only validate permanent filters when a mode is specified
      if (currentMode && hasPermanent) {
        const isValid = this.filterStateService.validatePermanentFilters();
        if (!isValid) {
          console.error('[CourseCatalog] SECURITY VIOLATION: Permanent filters have been tampered with. Logging out user.');
          this.authService.logout();
        }
      }
    });
  }

  ngOnInit(): void {
    // Validate access permissions based on mode
    this.validateAccess();
    
    // Clear all filters when entering the catalog page
    this.filterStateService.clearAllFilters();
    console.log('[CourseCatalog] All filters cleared on page init');
    
    // Set up permanent filters based on mode and context
    this.setupPermanentFilters();
  }

  private setupPermanentFilters(): void {
    const context = this.positionService.selectedContext();
    const currentMode = this.mode();
    const isAuthenticated = this.authService.isAuthenticated();
    const isStudent = this.isStudentRoute();

    // Never set permanent filters on student/courses route (public access)
    if (isStudent) {
      console.log('[CourseCatalog] Student route - no permanent filters will be applied');
      return;
    }

    // If no mode is specified, don't set any permanent filters
    if (!currentMode) {
      console.log('[CourseCatalog] No mode specified - no permanent filters will be applied');
      return;
    }

    // For mode info on course-catalog: only set permanent filters if user is authenticated
    if (currentMode === 'info') {
      if (!isAuthenticated) {
        console.log('[CourseCatalog] Info mode without authentication - no permanent filters');
        return;
      }
      
      if (!context || !context.campus?.id) {
        console.warn('[CourseCatalog] Info mode with authenticated user but no context/campus - no permanent filters');
        return;
      }

      // Authenticated user in info mode: permanent campus filter
      const permanentFilters = { campusId: context.campus.id };
      this.filterStateService.setPermanentFilters(permanentFilters);
      console.log('[CourseCatalog] Info mode (authenticated): Setting permanent campus filter:', context.campus.id);
      return;
    }

    // For modes statistics and planner: context is required
    if (!context) {
      console.warn('[CourseCatalog] No context available for setting permanent filters');
      return;
    }

    const permanentFilters: { campusId?: number; userId?: number } = {};

    // Mode statistics: Permanent campus filter
    if (currentMode === 'statistics') {
      if (context.campus?.id) {
        permanentFilters.campusId = context.campus.id;
        console.log('[CourseCatalog] Statistics mode: Setting permanent campus filter:', context.campus.id);
      } else {
        console.error('[CourseCatalog] Statistics mode requires a campus in context');
        this.router.navigate(['/option-page']);
        return;
      }
    }

    // Mode planner: Permanent campus + teacher filters
    if (currentMode === 'planner') {
      if (!context.campus?.id) {
        console.error('[CourseCatalog] Planner mode requires a campus in context');
        this.router.navigate(['/option-page']);
        return;
      }

      permanentFilters.campusId = context.campus.id;
      console.log('[CourseCatalog] Planner mode: Setting permanent campus filter:', context.campus.id);

      // Add teacher filter if user is a teacher
      if (this.isTeacher()) {
        const userPositions = this.positionService.userPositions();
        if (userPositions?.userId) {
          permanentFilters.userId = userPositions.userId;
          console.log('[CourseCatalog] Planner mode: Setting permanent teacher filter:', userPositions.userId);
        } else {
          console.error('[CourseCatalog] Planner mode for teachers requires userId in context');
          this.router.navigate(['/option-page']);
          return;
        }
      }
    }

    // Apply permanent filters if any were set
    if (Object.keys(permanentFilters).length > 0) {
      this.filterStateService.setPermanentFilters(permanentFilters);
      console.log('[CourseCatalog] Permanent filters applied:', permanentFilters);
    }
  }
  
  private validateAccess(): void {
    const currentMode = this.mode();
    const isStudent = this.isStudentRoute();
    
    // Always allow access on student/courses route (public access)
    if (isStudent) {
      console.log('[CourseCatalog] Student route - open access to all');
      return;
    }
    
    // Allow access when no mode is specified
    if (!currentMode) {
      console.log('[CourseCatalog] No mode specified - open access');
      return;
    }
    
    // Info mode is open to all
    if (currentMode === 'info') return;

    const context = this.positionService.selectedContext();
    
    if (!context) {
      console.warn('[CourseCatalog] No context available, redirecting to option-page');
      this.router.navigate(['/option-page']);
      return;
    }
    
    // Validar acceso a modo planner: solo para TEACHER
    if (currentMode === 'planner' && !this.isTeacher()) {
      console.warn('[CourseCatalog] Access denied to planner mode - user is not a TEACHER in this context');
      this.router.navigate(['/option-page']);
      return;
    }
    
    console.log('[CourseCatalog] Access validated - mode:', currentMode, 'roles:', context.roles);
  }
}