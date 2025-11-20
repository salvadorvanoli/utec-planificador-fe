import { Injectable, inject } from '@angular/core';
import { CourseService } from './course.service';
import html2pdf from 'html2pdf.js';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly courseService = inject(CourseService);

  async generateCoursePdf(courseId: number): Promise<void> {
    try {
      // 1. Obtener los datos del curso
      const pdfData = await this.courseService.getCoursePdfData(courseId).toPromise();
      
      if (!pdfData) {
        throw new Error('No se pudieron obtener los datos del curso');
      }

      // 2. Crear el HTML del PDF
      const htmlContent = this.generateHtmlContent(pdfData);

      // 3. Configurar opciones de html2pdf
      const options = {
        margin: 10,
        filename: `ficha-curso-${courseId}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      // 4. Generar y descargar el PDF
      await html2pdf().set(options).from(htmlContent).save();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }

  private generateHtmlContent(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00A9E0; margin-bottom: 10px;">UTEC</h1>
          <h2 style="color: #666; font-size: 18px;">Ficha de Información del Curso</h2>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px;">
            Información General
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">Descripción:</td>
              <td style="padding: 8px;">${data.description || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Unidad Curricular:</td>
              <td style="padding: 8px;">${data.curricularUnit?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Programa:</td>
              <td style="padding: 8px;">${data.programName || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Créditos:</td>
              <td style="padding: 8px;">${data.curricularUnit?.credits || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Turno:</td>
              <td style="padding: 8px;">${this.formatShift(data.shift)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px;">
            Fechas
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">Fecha de inicio:</td>
              <td style="padding: 8px;">${this.formatDate(data.startDate)}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Fecha de fin:</td>
              <td style="padding: 8px;">${this.formatDate(data.endDate)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px;">
            Docentes
          </h3>
          <ul style="list-style: none; padding: 0; margin-top: 10px;">
            ${data.teachers?.map((teacher: any) => `
              <li style="padding: 8px; background-color: #f5f5f5; margin-bottom: 5px; border-radius: 4px;">
                <strong>${teacher.name} ${teacher.lastName}</strong><br>
                <span style="color: #666; font-size: 14px;">${teacher.email}</span>
              </li>
            `).join('') || '<li>No hay docentes asignados</li>'}
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px;">
            Horas por Formato
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            ${Object.entries(data.hoursPerDeliveryFormat || {}).map(([format, hours]) => `
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 8px; font-weight: bold; width: 40%;">${this.formatDeliveryFormat(format)}:</td>
                <td style="padding: 8px;">${hours} horas</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px;">
            Información Adicional
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">Sistema de calificación:</td>
              <td style="padding: 8px;">${this.formatGradingSystem(data.partialGradingSystem)}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Relacionado con investigación:</td>
              <td style="padding: 8px;">${data.isRelatedToInvestigation ? 'Sí' : 'No'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Involucra sector productivo:</td>
              <td style="padding: 8px;">${data.involvesActivitiesWithProductiveSector ? 'Sí' : 'No'}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  private formatShift(shift: string): string {
    const shifts: Record<string, string> = {
      'MORNING': 'Mañana',
      'AFTERNOON': 'Tarde',
      'NIGHT': 'Noche'
    };
    return shifts[shift] || shift;
  }

  private formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-UY', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private formatGradingSystem(system: string): string {
    const systems: Record<string, string> = {
      'TRADITIONAL': 'Tradicional',
      'PGS_1': 'PGS 1',
      'PGS_2': 'PGS 2'
    };
    return systems[system] || system;
  }

  private formatDeliveryFormat(format: string): string {
    const formats: Record<string, string> = {
      'IN_PERSON': 'Presencial',
      'VIRTUAL': 'Virtual',
      'HYBRID': 'Híbrido',
      'ONLINE': 'En línea'
    };
    return formats[format] || format;
  }
}
