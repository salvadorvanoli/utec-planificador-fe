import { ChangeDetectionStrategy, Component, input, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OptionCardComponent } from '../option-card/option-card';
import { Skeleton } from 'primeng/skeleton';
import { PositionService } from '@app/core/services';
import { RegionalTechnologicalInstitute, Campus } from '@app/core/models';
import { Role } from '@app/core/enums/role';
import { buildContextQueryParams } from '@app/shared/utils/context-encoder';

type SelectionStep = 'itr' | 'campus' | 'main-menu';

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

  readonly hasTeacherRole = computed(() =>
    this.positionService.availableRoles().includes(Role.TEACHER)
  );

  readonly hasCoordinatorRole = computed(() =>
    this.positionService.availableRoles().includes(Role.COORDINATOR)
  );

  readonly hasAnalystRole = computed(() =>
    this.positionService.availableRoles().includes(Role.ANALYST)
  );

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
        queryParams: { ...contextParams, docente: true, mode: 'planner' }
      });
    } else if (action === 'estadistico') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { ...contextParams, docente: this.hasTeacherRole(), mode: 'statistics' }
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
        queryParams: { ...contextParams, docente: false, mode: 'info' }
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

