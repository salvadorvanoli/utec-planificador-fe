import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoButton } from './components/info-button/info-button';
import { DropDown } from './components/drop-down/drop-down';
import { type InfoTypeValue } from '@app/core/enums/info';

type Color = 'blue' | 'black';

@Component({
  selector: 'app-section-header',
  imports: [CommonModule, InfoButton, DropDown],
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeader {
  readonly color = input<Color>('blue');
  readonly infoType = input.required<InfoTypeValue>();
  readonly showIcon = input<boolean>(false);

}
