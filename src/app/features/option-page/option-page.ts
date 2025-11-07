import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { OptionPanel } from '@app/features/option-page/components/option-panel/option-panel';
import { ActivatedRoute, Router } from '@angular/router';
import { PositionService } from '@app/core/services';

type SelectionStep = 'itr' | 'campus' | 'main-menu';

@Component({
  selector: 'app-option-page',
  imports: [SectionHeader, OptionPanel],
  templateUrl: './option-page.html',
  styleUrl: './option-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionPage implements OnInit {
  readonly InfoType = InfoType;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly positionService = inject(PositionService);
  readonly step = signal<SelectionStep>(this.getInitialStep());

  private getInitialStep(): SelectionStep {
    const context = this.positionService.selectedContext();
    if (context?.itr && context?.campus && context?.roles.length > 0) {
      return 'main-menu';
    } else if (context?.itr) {
      return 'campus';
    }
    return 'itr';
  }

  ngOnInit(): void {
    this.positionService.getUserPositions().subscribe({
      next: () => {
        this.route.queryParams.subscribe(query => {
          if (query['step'] === 'campus') {
            this.step.set('campus');
          } else if (query['step'] === 'main-menu' || query['mainMenu'] === 'true') {
            this.step.set('main-menu');
          } else if (!query['step']) {
            this.determineStepFromContext();
          }
        });
      },
      error: (error) => {
        console.error('[OptionPage] Error loading user positions:', error);
        this.router.navigate(['/home']);
      }
    });
  }

  private determineStepFromContext(): void {
    const context = this.positionService.selectedContext();

    if (context?.itr && context?.campus && context?.roles.length > 0) {
      this.step.set('main-menu');
    } else if (context?.itr) {
      this.step.set('campus');
    } else {
      this.step.set('itr');
    }
  }
}
