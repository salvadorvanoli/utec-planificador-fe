import { ChangeDetectionStrategy, input, Component,signal } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { OptionPanel } from '@app/features/option-page/components/option-panel/option-panel';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-option-page',
  imports: [SectionHeader, OptionPanel],
  templateUrl: './option-page.html',
  styleUrl: './option-page.scss'
})
export class OptionPage {
  readonly InfoType = InfoType;
  readonly mainMenu = signal(true);
  private readonly route = inject(ActivatedRoute);
  
  constructor() {
    this.route.queryParams.subscribe(query => {
      if ('mainMenu' in query) {
        this.mainMenu.set(query['mainMenu'] === 'true');
      }
    });
  }
}
