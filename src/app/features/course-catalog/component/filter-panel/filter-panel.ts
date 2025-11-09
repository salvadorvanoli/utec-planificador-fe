import { ChangeDetectionStrategy, effect, Component, signal, input, inject, OnInit } from '@angular/core';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { Selector, EnumOption } from '@app/shared/components/select/select'
import { PositionService } from '@app/core/services/position.service';
import { PeriodResponse } from '@app/core/models/position';

@Component({
  selector: 'app-filter-panel',
  imports: [ColorBlock, Selector],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterPanel implements OnInit {
  private readonly positionService = inject(PositionService);

  readonly docente = input<boolean>(false);
  readonly docenteState = signal<boolean>(false);

  readonly periods = signal<PeriodResponse[]>([]);
  readonly periodsOptions = signal<EnumOption[]>([]);
  readonly selectedPeriod = signal<string | null>(null);
  readonly isLoadingPeriods = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.docenteState.set(this.docente());
    });

    effect(() => {
      const context = this.positionService.selectedContext();
      if (context?.campus && this.docente()) {
        this.loadPeriods(context.campus.id);
      } else {
        this.periods.set([]);
        this.periodsOptions.set([]);
      }
    });
  }

  ngOnInit(): void {
    const context = this.positionService.selectedContext();
    if (context?.campus && this.docente()) {
      this.loadPeriods(context.campus.id);
    }
  }

  private loadPeriods(campusId: number): void {
    this.isLoadingPeriods.set(true);
    
    this.positionService.getUserPeriodsByCampus(campusId).subscribe({
      next: (periods) => {
        this.periods.set(periods);

        this.periodsOptions.set(
          periods.map(p => ({
            value: p.period,
            displayValue: p.period
          }))
        );
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
    console.log('Period selected:', period);
  }
}
