import { ChangeDetectionStrategy, output, computed, input, Component } from '@angular/core';
import { Button } from 'primeng/button';

type Color = 'blue' | 'black' | 'red' | 'white';

@Component({
  selector: 'app-button',
  imports: [Button],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--button-bg]': 'buttonBgColor()',
    '[style.--button-bg-hover]': 'buttonBgHoverColor()',
    '[style.--button-font-family]': 'fontFamily()',
    '[style.--button-font-weight]': 'fontWeight()',
    '[style.--button-font-size]': 'fontSize()',
    '[style.--button-text-color]': 'textColor()'  
  }
})
export class ButtonComponent {
  readonly color = input<Color>('blue');
  readonly label = input<string>('Button');
  readonly fontFamily = input<string>('inherit');
  readonly fontWeight = input<string | number>('400');
  readonly fontSize = input<string>('1rem');
  readonly onClick = output<MouseEvent>();;
  readonly textColor = input<string>('#FFFFFF');

  readonly buttonBgColor = computed(() => {
    switch (this.color()) {
      case 'blue':
        return '#00A9E0';
      case 'red':
        return '#E61610';
      case 'white':
        return '#FFFFFF'; 
      case 'black':
      default:
        return '#000000';
    }
  });

  readonly buttonBgHoverColor = computed(() => {
    switch (this.color()) {
      case 'blue':
        return '#0090b8';
      case 'red':
        return '#c50e0a'; 
      case 'white':
        return '#f3f4f6'; 
      case 'black':
      default:
        return '#333333'; 
    }
  });
}