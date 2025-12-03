import { Component, input, inject, signal } from '@angular/core';
import { ColorBlock } from '../../../../shared/components/color-block/color-block';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { AiAgentService, PdfService } from '@app/core/services';
import { ConfirmationService, MessageService } from 'primeng/api';
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
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
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

    this.confirmationService.confirm({
      header: 'Confirmar descarga de reporte',
      message: 'Se generará y descargará un archivo PDF con el reporte de calidad del curso. ¿Desea continuar?',
      icon: 'pi pi-file-pdf',
      acceptLabel: 'Descargar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        try {
          this.isGenerating.set(true);
          const response = await firstValueFrom(this.aiAgentService.generateReport({ courseId: id }));
          await this.pdfService.generateAiReportPdf(id, response);
          this.messageService.add({
            severity: 'success',
            summary: 'Reporte generado',
            detail: 'El reporte se ha generado exitosamente'
          });
        } catch (error) {
          console.error('[ReportPanel] Error generating report:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al generar el reporte. Por favor, intenta nuevamente.'
          });
        } finally {
          this.isGenerating.set(false);
        }
      }
    });
  }
}
