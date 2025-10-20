import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-card-container',
  templateUrl: './card-container.html',
  styleUrl: './card-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.card-container]': 'true',
    '[style.maxHeight]': 'maxHeight()',   
    '[style.overflowY]': '"auto"',        
    '[style.display]': '"block"'          
  }
})
export class CardContainer {
  readonly maxHeight = input<string>('350px');
  readonly hasCards = input<boolean>(false);

  readonly showEmptyText = computed(() => !this.hasCards());
}
