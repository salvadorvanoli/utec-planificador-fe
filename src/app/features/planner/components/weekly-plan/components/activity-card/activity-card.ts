import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--activity-bg]': 'color()'
  }
})
export class ActivityCard {
  readonly color = input<string>('#ffffff');
  readonly titulo = input<string>('Título por defecto');
  readonly descripcion = input<string>('Descripción por defecto');
}
