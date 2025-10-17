import { Component, input } from '@angular/core';

@Component({
  selector: 'app-titulo',
  imports: [],
  templateUrl: './titulo.html',
  styleUrl: './titulo.scss'
})
export class Titulo {
  readonly texto = input<string>('');
}
