import { ChangeDetectionStrategy, Component,signal } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { FilterPanel} from '@app/features/course-catalog/component/filter-panel/filter-panel';
import { Paginator } from '@app/shared/components/paginator/paginator'; 
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
  readonly alumno = signal(true);
  private readonly route = inject(ActivatedRoute);

  constructor() {
  this.route.queryParams.subscribe(query => {
    console.log('Query params:', query); 
    if ('alumno' in query) {
      this.alumno.set(query['alumno'] === 'true');
    }
  });
}
}