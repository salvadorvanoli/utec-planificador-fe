import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.html',
  styleUrls: ['./content-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--color]': 'color()',
    '[style.--duration]': 'animateDuration() + \"ms\"' 
  }
})
export class ContentCard {
  color = input<string>('#3b82f6'); // valor por defecto azul
  titulo = input<string>('Investigación inicial');
  descripcion = input<string>('Descripción por defecto');

  // duración en ms (opcional, se puede pasar desde el padre)
  animateDuration = input<number>(800);
}
