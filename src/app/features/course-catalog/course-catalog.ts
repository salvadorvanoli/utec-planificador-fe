import { ChangeDetectionStrategy, Component,signal } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { FilterPanel} from '@app/features/course-catalog/component/filter-panel/filter-panel';
import { ContentPanel } from '@app/features/course-catalog/component/content-panel/content-panel';
import { InfoType } from '@app/core/enums/info';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-course-catalog',
  imports: [SectionHeader, FilterPanel, ContentPanel],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCatalog {
  readonly InfoType = InfoType;
  readonly docente = signal(false);
  private readonly route = inject(ActivatedRoute);

  constructor() {
  this.route.queryParams.subscribe(query => {
    console.log('Query params:', query); 
    if ('docente' in query) {
      this.docente.set(query['docente'] === 'true');
    }
  });
}
}