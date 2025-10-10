import { Component } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { DataPanel } from '@app/features/statistics-page/components/data-panel/data-panel';
import { ReportPanel } from '@app/features/statistics-page/components/report-panel/report-panel';

@Component({
  selector: 'app-statistics-page',
  imports: [SectionHeader, DataPanel, ReportPanel],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.scss'
})
export class StatisticsPage {
  readonly InfoType = InfoType;
}
