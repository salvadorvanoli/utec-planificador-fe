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
  readonly step = signal<SelectionStep>('itr');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly positionService = inject(PositionService);

  ngOnInit(): void {
    console.log('[OptionPage] Component initialized');
    this.route.queryParams.subscribe(query => {
      console.log('[OptionPage] Query params:', query);
      if (query['step'] === 'campus') {
        console.log('[OptionPage] Setting step to campus');
        this.step.set('campus');
      } else if (query['step'] === 'main-menu' || query['mainMenu'] === 'true') {
        console.log('[OptionPage] Setting step to main-menu');
        this.step.set('main-menu');
      } else {
        console.log('[OptionPage] Loading positions');
        this.loadPositions();
      }
    });
  }

  private loadPositions(): void {
    this.positionService.getUserPositions().subscribe({
      next: () => {
        console.log('[OptionPage] Positions loaded, setting step to itr');
        this.step.set('itr');
      },
      error: (error) => {
        console.error('[OptionPage] Error loading user positions:', error);
        this.router.navigate(['/home']);
      }
    });
  }
}
