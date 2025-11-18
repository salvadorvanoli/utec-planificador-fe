import { Component, input } from '@angular/core';
import { ColorBlock } from '../../../../shared/components/color-block/color-block';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Selector } from '../../../../shared/components/select/select';

@Component({
  selector: 'app-report-panel',
  imports: [ColorBlock, ButtonComponent, Selector],
  templateUrl: './report-panel.html',
  styleUrl: './report-panel.scss'
})
export class ReportPanel {
  courseId = input.required<number>();

  // TODO: Implement report generation logic with courseId
  generateReport(): void {
    console.log('[ReportPanel] Generating report for courseId:', this.courseId());
    // Future implementation: call AI agent service to generate report
  }
}
