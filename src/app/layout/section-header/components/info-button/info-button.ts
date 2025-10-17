import { ChangeDetectionStrategy, computed, Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

type Color = 'blue' | 'black';

@Component({
  selector: 'app-info-button',
  imports: [TooltipModule],
  templateUrl: './info-button.html',
  styleUrl: './info-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'color() === "blue" ? "tooltip-blue" : "tooltip-black"'
  }
})
export class InfoButton {
  readonly content = input.required<string>();
  readonly color = input<Color>('blue');

  readonly tooltipText = computed(() => {
    return this.content() || 'Información adicional';
  });
}