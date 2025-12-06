import { ChangeDetectionStrategy, Component, computed, input, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { PositionService } from '@app/core/services';
import { extractContextFromUrl, buildContextQueryParams } from '@app/shared/utils/context-encoder';

type Color = 'blue' | 'black';

interface MenuOption {
  id: string;
  name: string;
  icon: string;
}

interface BreadcrumbConfig {
  route: string;
  breadcrumb: string[];
}

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.html',
  styleUrls: ['./drop-down.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectModule, FormsModule],
  host: {
    '[style.--dropdown-bg-color]': 'color() === "blue" ? "#00A9E0" : "#000000"',
    '[style.--dropdown-border-color]': 'color() === "blue" ? "#00A9E0" : "#000000"',
    '[style.--dropdown-overlay-bg]': 'color() === "blue" ? "#000000" : "#00A9E0"',
    '[style.--dropdown-hover-color]': 'color() === "blue" ? "#333333" : "#0088b8"'
  }
})
export class DropDown {
  readonly color = input<Color>('blue');
  private readonly router = inject(Router);
  private readonly positionService = inject(PositionService);

  private readonly routeToBreadcrumb: BreadcrumbConfig[] = [
    { route: '/home', breadcrumb: ['home'] },
    { route: '/option-page', breadcrumb: ['home', 'menu'] },
    { route: '/course-catalog', breadcrumb: ['home', 'menu', 'catalog'] },
    { route: '/planner', breadcrumb: ['home', 'menu', 'catalog', 'planner'] },
    { route: '/statistics-page', breadcrumb: ['home', 'menu', 'catalog', 'statistics'] },
    { route: '/course-details', breadcrumb: ['home', 'menu', 'catalog', 'details'] },
    { route: '/chat-page', breadcrumb: ['home', 'menu', 'chat'] },
    { route: '/assign-page', breadcrumb: ['home', 'menu', 'catalog', 'assign'] },
  ];

  private readonly allOptions: MenuOption[] = [
    { id: 'home', name: 'Home', icon: 'pi pi-home' },
    { id: 'menu', name: 'Menu', icon: 'pi pi-bars' },
    { id: 'catalog', name: 'Catalog', icon: 'pi pi-search' },
    { id: 'planner', name: 'Planner', icon: 'pi pi-calendar' },
    { id: 'details', name: 'Details', icon: 'pi pi-info-circle' },
    { id: 'chat', name: 'Chat', icon: 'pi pi-comment' },
    { id: 'statistics', name: 'Statistics', icon: 'pi pi-chart-bar' },
    { id: 'itr', name: 'ITR', icon: 'pi pi-map-marker' },
    { id: 'assign', name: 'Assign', icon: 'pi pi-users' },
  ];

  private readonly idToRoute: Record<string, { path: string; contextData?: any }> = {
    home: { path: '/home' },
    menu: { path: '/option-page', contextData: { step: 'main-menu' } },
    catalog: { path: '/course-catalog', contextData: { mode: 'info' } },
    planner: { path: '/planner' },
    details: { path: '/course-details' },
    statistics: { path: '/statistics-page' },
    chat: { path: '/chat-page' },
    itr: { path: '/option-page', contextData: { step: 'campus' } },
    assign: { path: '/assign-page' },
  };

  readonly _options = signal<MenuOption[]>([]);
  options = this._options;
  selectedId = signal('home');
  isDropdownOpen = signal(false);

  dropdownIcon = computed(() =>
    this.isDropdownOpen() ? 'pi pi-caret-down' : 'pi pi-caret-left'
  );

  constructor() {
    this.ensureContextFromUrl();

    this.updateBreadcrumbFromRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateBreadcrumbFromRoute(event.urlAfterRedirects);
      });

    effect(() => {
      this.positionService.selectedContext();
      this.updateBreadcrumbFromRoute(this.router.url);
    });

    effect(() => {
      const positions = this.positionService.userPositions();
      if (positions && !this.positionService.selectedContext()) {
        this.ensureContextFromUrl();
      }
    });
  }

  private ensureContextFromUrl(): void {
    if (!this.positionService.selectedContext()) {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryParams: Record<string, string> = {};
        params.forEach((value, key) => queryParams[key] = value);

        const contextParams = extractContextFromUrl(queryParams);

        if (queryParams['ctx'] && !contextParams) {
          console.warn('[DropDown] Invalid context token in URL');
          return;
        }

        if (contextParams?.itrId && contextParams?.campusId && contextParams.campusId !== -1) {
          const positions = this.positionService.userPositions();

          if (positions) {
            const context = this.positionService.buildContextFromUrlParams(contextParams.itrId, contextParams.campusId);

            if (context) {
              this.positionService.selectedContext.set(context);
              this.positionService.availableRoles.set(context.roles);
            }
          }
        }
      } catch (error) {
        console.error('[DropDown] Error ensuring context from URL:', error);
      }
    }
  }

  private updateBreadcrumbFromRoute(url: string): void {
    const [cleanUrl] = url.split('?');

    // Normalize trailing slashes
    const normalizedUrl = cleanUrl.endsWith('/') && cleanUrl.length > 1 ? cleanUrl.slice(0, -1) : cleanUrl;

    // Find a config that either equals the normalized url or is a prefix (for nested routes)
    let config = this.routeToBreadcrumb.find((config) => normalizedUrl === config.route || normalizedUrl.startsWith(config.route + '/'));

    // Special handling for option-page since it depends on context
    if (normalizedUrl.startsWith('/option-page')) {
      const context = this.positionService.selectedContext();

      if (context?.campus && context?.itr) {
        config = { route: '/option-page', breadcrumb: ['home', 'menu'] };
      } else if (context?.itr && !context?.campus) {
        config = { route: '/option-page', breadcrumb: ['home', 'menu', 'itr'] };
      } else {
        config = { route: '/option-page', breadcrumb: ['home', 'menu'] };
      }
    }

    // If we didn't find a config yet, try to map some common nested routes to broader configs
    if (!config) {
      if (normalizedUrl.startsWith('/planner')) {
        config = { route: '/planner', breadcrumb: ['home', 'menu', 'catalog', 'planner'] };
      } else if (normalizedUrl.startsWith('/statistics-page')) {
        config = { route: '/statistics-page', breadcrumb: ['home', 'menu', 'catalog', 'statistics'] };
      } else if (normalizedUrl.startsWith('/course-details')) {
        config = { route: '/course-details', breadcrumb: ['home', 'menu', 'catalog', 'details'] };
      } else if (normalizedUrl.startsWith('/course-catalog')) {
        config = { route: '/course-catalog', breadcrumb: ['home', 'menu', 'catalog'] };
      } else if (normalizedUrl.startsWith('/assign-page')) {
        config = { route: '/assign-page', breadcrumb: ['home', 'menu', 'catalog', 'assign'] };
      }
    }

    if (config) {
      const breadcrumbOptions = config.breadcrumb
        .map((id) => this.allOptions.find((opt) => opt.id === id))
        .filter((opt): opt is MenuOption => opt !== undefined);

      this._options.set(breadcrumbOptions);

      const lastId = config.breadcrumb[config.breadcrumb.length - 1];
      this.selectedId.set(lastId);
    } else {
      this._options.set([this.allOptions[0]]);
      this.selectedId.set('home');
    }
  }

  updateSelection(id: string) {
    if (this.selectedId() === id) {
      this.selectedId.set('');
      setTimeout(() => this.selectedId.set(id), 0);
    }

    const routeConfig = this.idToRoute[id];
    if (routeConfig) {
      try {
        const currentParams = new URLSearchParams(window.location.search);
        const queryParams: Record<string, string> = {};
        currentParams.forEach((value, key) => queryParams[key] = value);
        const contextParams = extractContextFromUrl(queryParams);

      const protectedRoutes = ['/course-catalog', '/planner', '/statistics-page', '/course-details', '/chat-page', '/assign-page', '/pdf-preview'];

      if (routeConfig.path === '/option-page') {
        if (id === 'menu' && contextParams?.itrId && contextParams?.campusId) {
          const encodedParams = buildContextQueryParams({
            itrId: contextParams.itrId,
            campusId: contextParams.campusId,
            step: 'main-menu'
          });
          this.router.navigate([routeConfig.path], { queryParams: encodedParams });
          return;
        } else if (id === 'itr' && contextParams?.itrId) {
          const encodedParams = buildContextQueryParams({
            itrId: contextParams.itrId,
            campusId: -1,
            step: 'campus'
          });
          this.router.navigate([routeConfig.path], { queryParams: encodedParams });
          return;
        } else if (routeConfig.contextData) {
          // Si hay contextData pero no hay contexto de URL, codificar el contextData
          const encodedParams = buildContextQueryParams(routeConfig.contextData);
          this.router.navigate([routeConfig.path], { queryParams: encodedParams });
          return;
        } else {
          // Sin contexto, navegar sin query params
          this.router.navigate([routeConfig.path]);
          return;
        }
      }

      if (protectedRoutes.includes(routeConfig.path)) {
        if (contextParams?.itrId && contextParams?.campusId) {
          // Si el target es el catálogo, preservar el mode según la página actual
          const currentPath = this.router.url.split('?')[0];
          const modeFromCurrent = currentPath.startsWith('/planner') 
            ? 'planner' 
            : currentPath.startsWith('/statistics-page') 
            ? 'statistics' 
            : currentPath.startsWith('/course-details')
            ? 'info'
            : currentPath.startsWith('/assign-page')
            ? 'management'
            : undefined;
          
          // Determinar el mode: prioridad a modeFromCurrent, luego contextData, luego ninguno
          const mode = routeConfig.path === '/course-catalog' 
            ? (modeFromCurrent || routeConfig.contextData?.mode)
            : undefined;
          
          const encodedParams = buildContextQueryParams({
            itrId: contextParams.itrId,
            campusId: contextParams.campusId,
            ...(mode ? { mode } : {})
          });
          
          this.router.navigate([routeConfig.path], { queryParams: encodedParams });
          return;
        } else if (routeConfig.contextData) {
          // Si no hay contexto de URL pero hay contextData, intentar usarlo
          // (solo para rutas públicas como /student/courses)
          const encodedParams = buildContextQueryParams(routeConfig.contextData);
          this.router.navigate([routeConfig.path], { queryParams: encodedParams });
          return;
        }
      }

      // Fallback: navegación sin contexto completo
      this.router.navigate([routeConfig.path]);
      } catch (error) {
        console.error('[DropDown] Error in updateSelection:', error);
        this.router.navigate([routeConfig.path]);
      }
    }
  }

  setDropdownState(isOpen: boolean) {
    this.isDropdownOpen.set(isOpen);
  }
}
