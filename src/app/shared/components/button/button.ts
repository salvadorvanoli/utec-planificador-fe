import { ChangeDetectionStrategy, output, computed, input, Component } from '@angular/core';
import { Button } from 'primeng/button';

type Color = 'blue' | 'black' | 'red';

@Component({
  selector: 'app-button',
  imports: [Button],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--button-bg]': 'buttonBgColor()',
    '[style.--button-font-family]': 'fontFamily()',
    '[style.--button-font-weight]': 'fontWeight()',
    '[style.--button-font-size]': 'fontSize()'
  }
})
export class ButtonComponent {
  readonly color = input<Color>('blue');
  readonly label = input<string>('Button');
  readonly fontFamily = input<string>('inherit');
  readonly fontWeight = input<string | number>('400');
  readonly fontSize = input<string>('1rem');
  readonly onClick = output<MouseEvent>();;

  readonly buttonBgColor = computed(() => {
    switch (this.color()) {
      case 'blue':
        return '#00A9E0';
      case 'red':
        return '#E61610';
      case 'black':
      default:
        return '#000000';
    }
  });
}