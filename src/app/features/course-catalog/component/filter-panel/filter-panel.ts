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
  readonly docente = input<boolean>(false);
  readonly docenteState = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.docenteState.set(this.docente());
    });
  }
}
