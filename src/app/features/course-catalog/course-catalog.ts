import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed, effect } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { FilterPanel} from '@app/features/course-catalog/component/filter-panel/filter-panel';
import { ContentPanel } from '@app/features/course-catalog/component/content-panel/content-panel';
import { InfoType } from '@app/core/enums/info';
import { Role } from '@app/core/enums/role';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterStateService, PositionService, AuthService } from '@app/core/services';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';

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
  
  readonly mode = signal<'planner' | 'statistics' | 'info' | 'download' | 'management' | null>(null);
  
  // Computed: verify if the user has the TEACHER role in the current context
  readonly isTeacher = computed(() => {
    const context = this.positionService.selectedContext();
    return (context?.roles?.includes(Role.TEACHER)) ?? false;
  });

  // Computed: verify if user should see only their courses in statistics mode
  // True if user has TEACHER but does NOT have COORDINATOR or EDUCATION_MANAGER
  // (ANALYST doesn't grant access to all campus courses in statistics mode)
  readonly hasOnlyTeacherRole = computed(() => {
    const context = this.positionService.selectedContext();
    if (!context?.roles || context.roles.length === 0) return false;
    
    const hasTeacher = context.roles.includes(Role.TEACHER);
    const hasCoordinator = context.roles.includes(Role.COORDINATOR);
    const hasEducationManager = context.roles.includes(Role.EDUCATION_MANAGER);
    
    // User should see only their courses if they have TEACHER but lack privileged roles
    return hasTeacher && !hasCoordinator && !hasEducationManager;
  });

  // Computed: generates dynamic description based on mode and authentication status
  readonly dynamicDescription = computed(() => {
    const currentMode = this.mode();
    const isAuthenticated = this.authService.isAuthenticated();

    if (currentMode === 'planner') {
      return 'En esta página se listan únicamente los cursos para los cuales usted es docente. Puede seleccionar un curso para acceder a su planificación, donde podrá gestionar contenidos programáticos, actividades de aprendizaje, bibliografía y evaluación.';
    }

    if (currentMode === 'info') {
      if (isAuthenticated) {
        return 'En esta página se listan todos los cursos de la sede seleccionada previamente. Puede seleccionar cualquier curso para visualizar su información completa, incluyendo planificación semanal, contenidos programáticos y actividades.';
      } else {
        return 'En esta página se listan todos los cursos del sistema. Puede seleccionar cualquier curso para visualizar su información completa, incluyendo planificación semanal, contenidos programáticos y actividades.';
      }
    }

    if (currentMode === 'download') {
      return 'En esta página se listan todos los cursos del sistema. Puede descargar la información de cada curso, incluyendo su planificación completa, en formato PDF mediante el ícono de descarga en cada tarjeta.';
    }

    if (currentMode === 'statistics') {
      return 'En esta página se listan todos los cursos de la sede seleccionada. Puede seleccionar un curso para visualizar sus estadísticas detalladas, incluyendo distribución de horas, modalidades de aprendizaje y tipos de actividades.';
    }

    if (currentMode === 'management') {
      return 'En esta página se listan todos los cursos de la sede seleccionada. Puede editar o eliminar cursos según sea necesario. Tenga en cuenta que eliminar un curso es una acción permanente que no se puede deshacer.';
    }

    // Default description for catalog without specific mode
    return 'En esta página puede explorar el catálogo de unidades curriculares disponibles. Utilice los filtros para encontrar los cursos de su interés.';
  });
  
  // Computed: determines if it should filter by teacher (planner mode + is teacher)
  readonly shouldFilterByTeacher = computed(() => {
    return this.mode() === 'planner' && this.isTeacher();
  });

  // Computed: determines if campus filter should be permanent
  readonly shouldFilterByCampus = computed(() => {
    const currentMode = this.mode();
    
    // Campus is permanent for statistics, planner and info modes
    if (currentMode === 'statistics' || currentMode === 'planner' || currentMode === 'info') {
      return true;
    }
    
    // Download mode and no mode: no permanent filters (public access)
    return false;
  });

  constructor() {
    // Subscribe to queryParams to extract mode from encrypted context token
    this.route.queryParams.subscribe(query => {
      console.log('[CourseCatalog] Query params:', query);
      
      // Extract mode from encrypted context token
      const context = extractContextFromUrl(query);
      const mode = context?.mode;
      
      if (mode === 'planner' || mode === 'statistics' || mode === 'info' || mode === 'download' || mode === 'management') {
        console.log('[CourseCatalog] Setting mode from queryParams:', mode);
        this.mode.set(mode);
      } else {
        console.log('[CourseCatalog] No valid mode in queryParams');
        this.mode.set(null);
      }
    });

    // Effect to monitor filter tampering
    effect(() => {
      const currentMode = this.mode();
      const hasPermanent = this.filterStateService.hasPermanentFilters();
      
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

    // If no mode is specified, don't set any permanent filters
    if (!currentMode) {
      console.log('[CourseCatalog] No mode specified - no permanent filters will be applied');
      return;
    }

    // For mode download: no permanent filters (public access)
    if (currentMode === 'download') {
      console.log('[CourseCatalog] Download mode - no permanent filters (public access)');
      return;
    }

    // For mode info: only set permanent filters if user is authenticated
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

    // For modes statistics, management, and planner: context is required
    if (!context) {
      console.warn('[CourseCatalog] No context available for setting permanent filters');
      return;
    }

    const permanentFilters: { campusId?: number; userId?: number } = {};

    // Mode statistics: Permanent campus filter + userId if user has ONLY TEACHER role
    if (currentMode === 'statistics') {
      if (context.campus?.id) {
        permanentFilters.campusId = context.campus.id;
        console.log(`[CourseCatalog] statistics mode: Setting permanent campus filter:`, context.campus.id);
        
        // If user has ONLY TEACHER role (no admin roles), filter by userId automatically
        if (this.hasOnlyTeacherRole()) {
          const userPositions = this.positionService.userPositions();
          if (userPositions?.userId) {
            permanentFilters.userId = userPositions.userId;
            console.log('[CourseCatalog] statistics mode: User has ONLY TEACHER role, setting permanent userId filter:', userPositions.userId);
          }
        } else {
          console.log('[CourseCatalog] statistics mode: User has administrative roles, showing all campus courses');
        }
      } else {
        console.error(`[CourseCatalog] statistics mode requires a campus in context`);
        this.router.navigate(['/option-page']);
        return;
      }
    }

    // Mode management: Permanent campus filter only
    if (currentMode === 'management') {
      if (context.campus?.id) {
        permanentFilters.campusId = context.campus.id;
        console.log(`[CourseCatalog] management mode: Setting permanent campus filter:`, context.campus.id);
      } else {
        console.error(`[CourseCatalog] management mode requires a campus in context`);
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
    
    // Allow access when no mode is specified
    if (!currentMode) {
      console.log('[CourseCatalog] No mode specified - open access');
      return;
    }
    
    // Info and download modes are open to all (public access)
    if (currentMode === 'info' || currentMode === 'download') {
      console.log('[CourseCatalog] Public mode (' + currentMode + ') - open access to all');
      return;
    }

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