import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.html',
  styleUrl: './content-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--activity-bg]': 'color()',
    '[class.selected]': 'isSelected()',
    'style': 'cursor: pointer;'
  }
})
export class ContentCard {
  readonly color = input<string>('#ffffff');
  readonly titulo = input<string>('Título por defecto');
  readonly descripcion = input<string>('Descripción por defecto');
  readonly isSelected = input<boolean>(false);
}
