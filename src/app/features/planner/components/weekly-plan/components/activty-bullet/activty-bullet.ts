import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-activity-bullet',
  imports: [],
  templateUrl: './activty-bullet.html',
  styleUrl: './activty-bullet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--colour]': 'colour()'
  }
})
export class ActivtyBullet {
  readonly title = input<string>('Título por defecto');
  readonly content = input<string>('Contenido por defecto');
  readonly colour = input<string>('#3b82f6');
}
