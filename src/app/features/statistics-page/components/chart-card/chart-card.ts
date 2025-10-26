import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

type ChartData = {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
  }>;
};

type ChartOptions = unknown;

@Component({
  selector: 'app-chart-card',
  imports: [ChartModule, SkeletonModule],
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartCard {
  readonly titulo = input<string>('Título');
  readonly labels = input<string[]>('A,B,C'.split(','));
  readonly values = input<number[]>([300, 50, 100]);
  readonly colors = input<string[]>(['#06b6d4', '#fb923c', '#64748b']); 
  readonly hoverColors = input<string[]>(['#22d3ee', '#fdba74', '#94a3b8']); 
  isLoading = signal(true);
  readonly data = computed<ChartData>(() => ({
    labels: this.labels(),
    datasets: [
      {
        data: this.values(),
        backgroundColor: this.colors(),
        hoverBackgroundColor: this.hoverColors()
      }
    ]
  }));

  readonly options = signal<ChartOptions>({
    cutout: '60%',
    plugins: {
      legend: {
        labels: {
          color: '#222'
        }
      }
    }
  });

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500); 
  }

}
