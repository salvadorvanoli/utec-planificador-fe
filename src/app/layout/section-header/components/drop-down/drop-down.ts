import { ChangeDetectionStrategy, Component, computed, input, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

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

  private readonly routeToBreadcrumb: BreadcrumbConfig[] = [
    { route: '/home', breadcrumb: ['home'] },
    { route: '/option-page', breadcrumb: ['home', 'menu'] },
    { route: '/course-catalog', breadcrumb: ['home', 'menu', 'catalog'] },
    { route: '/planner', breadcrumb: ['home', 'menu', 'catalog', 'planner'] },
    { route: '/statistics-page', breadcrumb: ['home', 'menu', 'catalog', 'statistics'] },
    { route: '/chat-page', breadcrumb: ['home', 'menu', 'chat'] },
    { route: '/assign-page', breadcrumb: ['home', 'menu', 'itr', 'assign'] },
  ];

  private readonly allOptions: MenuOption[] = [
    { id: 'home', name: 'Home', icon: 'pi pi-home' },
    { id: 'menu', name: 'Menu', icon: 'pi pi-bars' },
    { id: 'catalog', name: 'Catalog', icon: 'pi pi-search' },
    { id: 'planner', name: 'Planner', icon: 'pi pi-calendar' },
    { id: 'chat', name: 'Chat', icon: 'pi pi-comment' },
    { id: 'statistics', name: 'Statistics', icon: 'pi pi-chart-bar' },
    { id: 'itr', name: 'ITR', icon: 'pi pi-map-marker' },
    { id: 'assign', name: 'Assign', icon: 'pi pi-users' },
  ];

  private readonly idToRoute: Record<string, { path: string; queryParams?: any }> = {
    home: { path: '/home' },
    menu: { path: '/option-page', queryParams: { mainMenu: true } },
    catalog: { path: '/course-catalog', queryParams: { docente: false, mode: 'info' } },
    planner: { path: '/planner' },
    statistics: { path: '/statistics-page' },
    chat: { path: '/chat-page' },
    itr: { path: '/option-page', queryParams: { mainMenu: false } },
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
    this.updateBreadcrumbFromRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateBreadcrumbFromRoute(event.urlAfterRedirects);
      });
  }

  private updateBreadcrumbFromRoute(url: string): void {
    const [cleanUrl, queryString] = url.split('?');
    const params = new URLSearchParams(queryString || '');

    let config = this.routeToBreadcrumb.find((config) => config.route === cleanUrl);

    if (cleanUrl === '/option-page' && params.get('mainMenu') === 'false') {
      config = { route: '/option-page', breadcrumb: ['home', 'menu', 'itr'] };
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
      if (routeConfig.queryParams) {
        this.router.navigate([routeConfig.path], { queryParams: routeConfig.queryParams });
      } else {
        this.router.navigate([routeConfig.path]);
      }
    }
  }

  setDropdownState(isOpen: boolean) {
    this.isDropdownOpen.set(isOpen);
  }
}


