import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-titulo',
  imports: [],
  templateUrl: './titulo.html',
  styleUrl: './titulo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--titulo-color]': 'tituloColor()'
  }
})
export class Titulo {
  readonly texto = input<string>('');
  readonly color = input<string>('black');

  readonly tituloColor = computed(() =>
    this.color() === 'blue' ? '#00A9E0' : '#000000'
  );
}
