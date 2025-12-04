import { ChangeDetectionStrategy, computed, Component, input, signal } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';

type Color = 'blue' | 'black';

@Component({
  selector: 'app-info-button',
  imports: [TooltipModule, Dialog],
  templateUrl: './info-button.html',
  styleUrl: './info-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'color() === "blue" ? "tooltip-blue" : "tooltip-black"'
  }
})
export class InfoButton {
  readonly content = input.required<string>();
  readonly description = input<string | null>(null);
  readonly color = input<Color>('blue');

  readonly showModal = signal(false);

  readonly tooltipText = computed(() => {
    return this.content() || 'Información adicional';
  });

  readonly hasDescription = computed(() => {
    const desc = this.description();
    return desc != null && desc.trim() !== '';
  });

  onButtonClick(): void {
    if (this.hasDescription()) {
      this.showModal.set(true);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}