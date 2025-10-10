import { ChangeDetectionStrategy, effect, Component, signal, input } from '@angular/core';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { Selector } from '@app/shared/components/select/select'

@Component({
  selector: 'app-filter-panel',
  imports: [ColorBlock, Selector],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterPanel {
  readonly alumno = input<boolean>(false);
  readonly alumnoState = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.alumnoState.set(this.alumno());
    });
  }
}
