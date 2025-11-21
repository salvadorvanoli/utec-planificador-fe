import { Component, input, inject, signal } from '@angular/core';
import { ColorBlock } from '../../../../shared/components/color-block/color-block';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { AiAgentService, PdfService } from '@app/core/services';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-report-panel',
  imports: [ColorBlock, ButtonComponent],
  templateUrl: './report-panel.html',
  styleUrl: './report-panel.scss'
})
export class ReportPanel {
  courseId = input.required<number>();

  private readonly aiAgentService = inject(AiAgentService);
  private readonly pdfService = inject(PdfService);
  readonly isGenerating = signal<boolean>(false);

  async generateReport(): Promise<void> {
    if (this.isGenerating()) {
      return;
    }

    const id = this.courseId();
    if (!id) {
      console.warn('[ReportPanel] No courseId provided');
      return;
    }

    try {
      this.isGenerating.set(true);
      const response = await firstValueFrom(this.aiAgentService.generateReport({ courseId: id }));
      await this.pdfService.generateAiReportPdf(id, response);
      console.log('[ReportPanel] Report PDF generated');
    } catch (error) {
      console.error('[ReportPanel] Error generating report:', error);
      alert('Error al generar el reporte. Por favor, intenta nuevamente.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
