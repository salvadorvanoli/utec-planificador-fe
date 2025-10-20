import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-container',
  templateUrl: './container.html',
  styleUrl: './container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--container-color]': 'color()'
  }
})
export class Container {
  readonly color = input<string>('#000000');
}
