import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoButton } from './components/info-button/info-button';
import { DropDown } from './components/drop-down/drop-down';
import { type InfoTypeValue } from '@app/core/enums/info';
import { BreadcrumbComponent } from '@app/shared/components/breadcrumb/breadcrumb';
type Color = 'blue' | 'black';

@Component({
  selector: 'app-section-header',
  imports: [CommonModule, InfoButton, DropDown],
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeader {
  readonly text = input<string>('');
  readonly color = input<Color>('blue');
  readonly infoType = input.required<InfoTypeValue>();
  readonly showIcon = input<boolean>(false);
  readonly customDescription = input<string | null>(null);

  readonly effectiveDescription = computed(() => {
    // Custom description takes precedence
    const custom = this.customDescription();
    if (custom != null && custom.trim() !== '') {
      return custom;
    }
    // Fall back to infoType description
    return this.infoType().description;
  });
}
