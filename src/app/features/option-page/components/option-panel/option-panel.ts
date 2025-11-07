import { ChangeDetectionStrategy, Component, input, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OptionCardComponent } from '../option-card/option-card';
import { Skeleton } from 'primeng/skeleton';
import { PositionService } from '@app/core/services';
import { RegionalTechnologicalInstitute, Campus } from '@app/core/models';

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
    this.positionService.availableRoles().includes('TEACHER')
  );

  readonly hasCoordinatorRole = computed(() =>
    this.positionService.availableRoles().includes('COORDINATOR')
  );

  readonly hasAnalystRole = computed(() =>
    this.positionService.availableRoles().includes('ANALYST')
  );

  handleITRSelection(itr: RegionalTechnologicalInstitute): void {
    this.positionService.selectITR(itr);
    this.router.navigate(['/option-page'], {
      queryParams: { step: 'campus' }
    });
  }

  handleCampusSelection(campus: Campus): void {
    this.positionService.selectCampus(campus);
    this.router.navigate(['/option-page'], {
      queryParams: { step: 'main-menu' }
    });
  }

  handleButtonClick(action: string): void {
    if (action === 'planificador') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { docente: true, mode: 'planner' }
      });
    } else if (action === 'estadistico') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { docente: this.hasTeacherRole(), mode: 'statistics' }
      });
    } else if (action === 'asignar-cursos') {
      this.router.navigate(['/assign-page']);
    } else if (action === 'chat') {
      this.router.navigate(['/chat-page']);
    } else if (action === 'info-cursos') {
      this.router.navigate(['/course-catalog'], {
        queryParams: { docente: false, mode: 'info' }
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
    this.positionService.clearRolesSelection();
    this.router.navigate(['/option-page'], {
      queryParams: { step: 'campus' }
    });
  }
}
