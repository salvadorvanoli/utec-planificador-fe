import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { FilterPanel} from '@app/features/course-catalog/component/filter-panel/filter-panel';
import { ContentPanel } from '@app/features/course-catalog/component/content-panel/content-panel';
import { InfoType } from '@app/core/enums/info';
import { ActivatedRoute } from '@angular/router';
import { FilterStateService } from '@app/core/services';

@Component({
  selector: 'app-course-catalog',
  imports: [SectionHeader, FilterPanel, ContentPanel],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCatalog implements OnInit {
  readonly InfoType = InfoType;
  readonly docente = signal(false);
  private readonly route = inject(ActivatedRoute);
  private readonly filterStateService = inject(FilterStateService);

  constructor() {
    this.route.queryParams.subscribe(query => {
      console.log('Query params:', query); 
      if ('docente' in query) {
        this.docente.set(query['docente'] === 'true');
      }
    });
  }

  ngOnInit(): void {
    // Clear all filters when entering the catalog page
    this.filterStateService.clearFilters();
    console.log('[CourseCatalog] Filters cleared on page init');
  }
}