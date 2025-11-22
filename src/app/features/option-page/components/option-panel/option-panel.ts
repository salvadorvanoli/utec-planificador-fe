import { ChangeDetectionStrategy, Component, input, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OptionCardComponent } from '../option-card/option-card';
import { Skeleton } from 'primeng/skeleton';
import { PositionService } from '@app/core/services';
import { RegionalTechnologicalInstitute, Campus } from '@app/core/models';
import { Role } from '@app/core/enums/role';
import { buildContextQueryParams } from '@app/shared/utils/context-encoder';

type SelectionStep = 'itr' | 'campus' | 'main-menu';

interface MenuCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  requiredRoles: Role[];
}

@Component({
  selector: 'app-option-panel',
  imports: [OptionCardComponent, Skeleton],
  templateUrl: './option-panel.html',
  styleUrl: './option-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionPanel {
  readonly step = input.required<SelectionStep>();
  readonly isLoading = signal(false);
  private readonly router = inject(Router);
  readonly positionService = inject(PositionService);

  // Definición de todas las tarjetas posibles con sus roles requeridos
  private readonly allMenuCards: MenuCard[] = [
    {
      id: 'planificador',
      icon: 'pi pi-calendar',
      title: 'Planificador',
      description: 'Organiza y gestiona tus planificaciones',
      action: 'planificador',
      requiredRoles: [Role.TEACHER]
    },
    {
      id: 'panel-estadistico',
      icon: 'pi pi-chart-bar',
      title: 'Panel Estadístico',
      description: 'Visualiza métricas y análisis de datos',
      action: 'estadistico',
      requiredRoles: [Role.TEACHER, Role.COORDINATOR, Role.EDUCATION_MANAGER]
    },
    {
      id: 'edubot',
      icon: 'pi pi-comments',
      title: 'EduBot',
      description: 'Chatea para asistencia académica',
      action: 'chat',
      requiredRoles: [Role.TEACHER]
    },
    {
      id: 'asignar-cursos',
      icon: 'pi pi-users',
      title: 'Asignar Cursos',
      description: 'Asigna docentes a los cursos',
      action: 'asignar-cursos',
      requiredRoles: [Role.COORDINATOR, Role.ANALYST]
    },
    {
      id: 'info-cursos',
      icon: 'pi pi-book',
      title: 'Información de Cursos',
      description: 'Consulta información sobre los cursos',
      action: 'info-cursos',
      requiredRoles: [Role.COORDINATOR, Role.EDUCATION_MANAGER]
    }
  ];

  // Computed que genera la lista única de tarjetas basada en los roles del usuario
  readonly availableMenuCards = computed(() => {
    const userRoles = this.positionService.availableRoles();
    const uniqueCards = new Map<string, MenuCard>();

    // Filtrar tarjetas que el usuario puede ver según sus roles
    this.allMenuCards.forEach(card => {
      const hasRequiredRole = card.requiredRoles.some(role => userRoles.includes(role));
      if (hasRequiredRole && !uniqueCards.has(card.id)) {
        uniqueCards.set(card.id, card);
      }
    });

    return Array.from(uniqueCards.values());
  });

  handleITRSelection(itr: RegionalTechnologicalInstitute): void {
    this.positionService.selectITR(itr);
    const queryParams = buildContextQueryParams({
      itrId: itr.id,
      campusId: -1,
      step: 'campus'
    });
    this.router.navigate(['/option-page'], { queryParams });
  }

  handleCampusSelection(campus: Campus): void {
    this.positionService.selectCampus(campus);
    const context = this.positionService.selectedContext();
    if (context) {
      const queryParams = buildContextQueryParams({
        itrId: context.itr.id,
        campusId: campus.id,
        step: 'main-menu'
      });
      this.router.navigate(['/option-page'], { queryParams });
    }
  }

  handleButtonClick(action: string): void {
    const context = this.positionService.selectedContext();
    if (!context) return;

    const contextParams = buildContextQueryParams({
      itrId: context.itr.id,
      campusId: context.campus.id
    });

    if (action === 'planificador') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { ...contextParams, mode: 'planner' }
      });
    } else if (action === 'estadistico') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { ...contextParams, mode: 'statistics' }
      });
    } else if (action === 'asignar-cursos') {
      this.router.navigate(['/assign-page'], {
        queryParams: contextParams
      });
    } else if (action === 'chat') {
      this.router.navigate(['/chat-page'], {
        queryParams: contextParams
      });
    } else if (action === 'info-cursos') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { ...contextParams, mode: 'info' }
      });
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goBackToITR(): void {
    this.positionService.clearCampusSelection();
    this.router.navigate(['/option-page']);
  }

  goBackToCampus(): void {
    const context = this.positionService.selectedContext();
    this.positionService.clearRolesSelection();
    if (context) {
      const queryParams = buildContextQueryParams({
        itrId: context.itr.id,
        campusId: -1,
        step: 'campus'
      });
      this.router.navigate(['/option-page'], { queryParams });
    } else {
      this.router.navigate(['/option-page']);
    }
  }
}

