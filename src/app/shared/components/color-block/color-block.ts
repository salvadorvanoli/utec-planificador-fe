import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Color = 'blue' | 'black'

@Component({
  selector: 'app-color-block',
  imports: [],
  templateUrl: './color-block.html',
  styleUrl: './color-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorBlock {
  readonly color = input<Color>();
}
