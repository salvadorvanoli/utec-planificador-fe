import { Injectable, inject } from '@angular/core';
import { CourseService } from './course.service';
import html2pdf from 'html2pdf.js';
import { ReportResponse } from '../models/ai-agent';

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

  async generateAiReportPdf(courseId: number, data: ReportResponse): Promise<void> {
    try {
      const htmlContent = this.generateReportHtmlContent(data);
      const options = {
        margin: 10,
        filename: `reporte-calidad-curso-${courseId}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      await html2pdf().set(options).from(htmlContent).save();
    } catch (error) {
      console.error('Error al generar PDF del reporte:', error);
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

        <div style="background-color: #fff8e1; border-left: 4px solid #ff9800; padding: 15px; margin-bottom: 24px; border-radius: 4px; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <strong style="color: #f57c00; font-size: 14px;">⚠️ INFORMACIÓN IMPORTANTE</strong>
          </div>
          <p style="margin: 0; color: #e65100; font-size: 13px; line-height: 1.5;">
            La planificación aquí presentada corresponde a una versión preliminar del curso y puede estar sujeta a modificaciones.
            El docente a cargo se reserva el derecho de realizar ajustes en los contenidos, metodología, cronograma y evaluaciones
            una vez iniciada la cursada, conforme a las necesidades pedagógicas que se identifiquen durante el desarrollo del curso.
            Se recomienda mantenerse atento a las comunicaciones oficiales del docente.
          </p>
        </div>

        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
            Información General
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">Descripción:</td>
              <td style="padding: 8px;">${data.description || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Unidad Curricular:</td>
              <td style="padding: 8px;">${data.curricularUnit.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Carrera:</td>
              <td style="padding: 8px;">${data.programName || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Créditos:</td>
              <td style="padding: 8px;">${data.curricularUnit.credits}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Turno:</td>
              <td style="padding: 8px;">${this.formatShift(data.shift)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
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

        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
            Docentes
          </h3>
          <ul style="list-style: none; padding: 0; margin-top: 10px;">
            ${data.teachers.length > 0 ? data.teachers.map((teacher: any) => `
              <li style="padding: 8px; background-color: #f5f5f5; margin-bottom: 5px; border-radius: 4px;">
                <strong>${teacher.name} ${teacher.lastName}</strong><br>
                <span style="color: #666; font-size: 14px;">${teacher.email}</span>
              </li>
            `).join('') : '<li>No hay docentes asignados</li>'}
          </ul>
        </div>

        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
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

        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
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

        ${data.weeklyPlannings && data.weeklyPlannings.length > 0 ? `
        <div style="margin-bottom: 20px; margin-top: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
            Planificación Semanal
          </h3>
          ${data.weeklyPlannings.map((week: any) => `
            <div style="margin-top: 15px; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #00A9E0; page-break-inside: avoid;">
              <h4 style="color: #333; margin: 0 0 8px 0; page-break-after: avoid;">
                Semana ${week.weekNumber} (${this.formatDate(week.startDate)} - ${this.formatDate(week.endDate)})
              </h4>
              ${week.contentTitles && week.contentTitles.length > 0 ? `
                <div style="margin-top: 8px;">
                  <strong style="color: #666;">Contenidos:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${week.contentTitles.map((title: string) => `
                      <li style="margin: 3px 0; color: #333;">${title}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              ${week.bibliographicReferences && week.bibliographicReferences.length > 0 ? `
                <div style="margin-top: 8px;">
                  <strong style="color: #666;">Referencias bibliográficas:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${week.bibliographicReferences.map((ref: string) => `
                      <li style="margin: 3px 0; color: #333; font-style: italic;">${ref}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.bibliography && data.bibliography.length > 0 ? `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">
            Bibliografía General del Curso
          </h3>
          <ul style="list-style: none; padding: 0; margin-top: 10px;">
            ${data.bibliography.map((ref: string) => `
              <li style="padding: 8px; background-color: #f5f5f5; margin-bottom: 5px; border-radius: 4px; font-style: italic;">
                ${ref}
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `;
  }



  private generateReportHtmlContent(response: ReportResponse): string {
    const r = response.report;
    const fmtDate = this.formatDate(r.analysisDate);
    const sectionTitle = (t: string) => `
      <h3 style="color: #00A9E0; border-bottom: 2px solid #00A9E0; padding-bottom: 5px; page-break-after: avoid;">${t}</h3>
    `;

    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #00A9E0; margin-bottom: 6px;">UTEC</h1>
          <h2 style="color: #666; font-size: 18px;">Reporte de Calidad del Curso</h2>
        </div>

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 24px; border-radius: 4px; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <strong style="color: #856404; font-size: 14px;">⚠️ AVISO IMPORTANTE</strong>
          </div>
          <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
            Este reporte ha sido generado mediante inteligencia artificial y constituye exclusivamente una herramienta de apoyo pedagógico.
            Los resultados y recomendaciones presentados deben ser interpretados y validados por el criterio profesional del docente.
            La decisión final sobre la implementación de cualquier sugerencia queda siempre bajo la responsabilidad del profesional de la educación.
          </p>
        </div>

        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          ${sectionTitle('Resumen General')}
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">Curso:</td>
              <td style="padding: 8px;">${r.courseId}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Fecha de análisis:</td>
              <td style="padding: 8px;">${fmtDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Mensaje:</td>
              <td style="padding: 8px;">${r.message}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          ${sectionTitle('Resumen Ejecutivo')}
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">Semanas totales:</td>
              <td style="padding: 8px;">${r.executiveSummary.totalWeeks}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Horas totales:</td>
              <td style="padding: 8px;">${r.executiveSummary.totalHours}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Horas presenciales:</td>
              <td style="padding: 8px;">${r.executiveSummary.inPersonHours}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Horas virtuales:</td>
              <td style="padding: 8px;">${r.executiveSummary.virtualHours}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Horas híbridas:</td>
              <td style="padding: 8px;">${r.executiveSummary.hybridHours}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Duración promedio de actividad:</td>
              <td style="padding: 8px;">${r.executiveSummary.averageActivityDuration}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          ${sectionTitle('Análisis Detallado')}
          <div style="margin-top: 8px;">
            <p style="margin: 6px 0;"><strong>Procesos cognitivos:</strong> ${r.detailedAnalysis.cognitiveProcesses}</p>
            <p style="margin: 6px 0;"><strong>Competencias transversales:</strong> ${r.detailedAnalysis.transversalCompetencies}</p>
            <p style="margin: 6px 0;"><strong>Balance de modalidades:</strong> ${r.detailedAnalysis.modalityBalance}</p>
            <p style="margin: 6px 0;"><strong>Estrategias didácticas:</strong> ${r.detailedAnalysis.teachingStrategies}</p>
            <p style="margin: 6px 0;"><strong>Recursos:</strong> ${r.detailedAnalysis.resources}</p>
            <p style="margin: 6px 0;"><strong>Vinculación con ODS:</strong> ${r.detailedAnalysis.sdgLinkage}</p>
          </div>
        </div>

        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          ${sectionTitle('Fortalezas')}
          <ul style="list-style: disc; padding-left: 20px; margin-top: 8px;">
            ${r.strengths.map(s => `<li style=\"margin: 4px 0;\">${s}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          ${sectionTitle('Áreas de mejora')}
          <ul style="list-style: disc; padding-left: 20px; margin-top: 8px;">
            ${r.improvementAreas.map(s => `<li style=\"margin: 4px 0;\">${s}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          ${sectionTitle('Recomendaciones')}
          <ul style="list-style: disc; padding-left: 20px; margin-top: 8px;">
            ${response.recommendations.map(s => `<li style=\"margin: 4px 0;\">${s}</li>`).join('')}
          </ul>
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
