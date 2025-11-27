import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '@app/shared/components/button/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OfficeHoursService } from '@app/core/services';
import { OfficeHoursRequest, OfficeHoursResponse } from '@app/core/models';

@Component({
  selector: 'app-office-hours',
  imports: [DialogModule, ButtonComponent, DatePicker, FloatLabel, InputTextModule, FormsModule, Toast],
  providers: [MessageService],
  templateUrl: './office-hours.html',
  styleUrl: './office-hours.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfficeHours {
  private readonly officeHoursService = inject(OfficeHoursService);
  private readonly messageService = inject(MessageService);

  // Inputs y outputs
  visible = input<boolean>(false);
  courseId = input.required<number>();
  onClose = output<void>();

  // Signal para los horarios desde el backend
  schedules = signal<OfficeHoursResponse[]>([]);
  isLoading = signal<boolean>(false);

  // Campos del formulario
  selectedDate = signal<Date | null>(null);
  startTime = signal<string>('');
  endTime = signal<string>('');

  constructor() {
    // Cargar horarios cuando el modal se abre
    effect(() => {
      if (this.visible()) {
        this.loadOfficeHours();
      }
    });
  }

  private loadOfficeHours(): void {
    this.isLoading.set(true);
    this.officeHoursService.getOfficeHoursByCourse(this.courseId()).subscribe({
      next: (response) => {
        console.log('[OfficeHours] Loaded schedules:', response);
        this.schedules.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[OfficeHours] Error loading schedules:', error);
        this.isLoading.set(false);
      }
    });
  }

  closeDialog(): void {
    this.onClose.emit();
  }

  removeSchedule(officeHours: OfficeHoursResponse): void {
    console.log('[OfficeHours] Remove schedule:', officeHours);
    this.isLoading.set(true);

    this.officeHoursService.deleteOfficeHours(officeHours.id).subscribe({
      next: () => {
        console.log('[OfficeHours] Schedule deleted successfully');
        // Actualizar la lista localmente
        const current = this.schedules();
        this.schedules.set(current.filter(s => s.id !== officeHours.id));
        this.isLoading.set(false);

        // Toast de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Horario eliminado',
          detail: 'El horario de consulta fue eliminado exitosamente',
          life: 3000
        });
      },
      error: (error) => {
        console.error('[OfficeHours] Error deleting schedule:', error);
        this.isLoading.set(false);

        // Toast de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el horario de consulta',
          life: 3000
        });
      }
    });
  }

  addSchedule(): void {
    const date = this.selectedDate();
    const start = this.startTime();
    const end = this.endTime();

    if (!date || !start || !end) {
      console.warn('[OfficeHours] Todos los campos son requeridos');
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Por favor complete todos los campos del formulario',
        life: 3000
      });
      return;
    }

    // Validar que la fecha sea posterior a la actual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      console.warn('[OfficeHours] La fecha debe ser posterior a la actual');
      this.messageService.add({
        severity: 'error',
        summary: 'Fecha inválida',
        detail: 'La fecha debe ser posterior a la fecha actual',
        life: 3000
      });
      return;
    }

    // Convertir Date a formato YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Validar que la hora de inicio sea menor que la hora de fin
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (startTimeInMinutes >= endTimeInMinutes) {
      console.warn('[OfficeHours] La hora de inicio debe ser menor que la hora de fin');
      this.messageService.add({
        severity: 'error',
        summary: 'Horario inválido',
        detail: 'La hora de inicio debe ser menor que la hora de fin',
        life: 3000
      });
      return;
    }

    const request: OfficeHoursRequest = {
      date: formattedDate,
      startTime: start,
      endTime: end,
      courseId: this.courseId()
    };

    console.log('[OfficeHours] Add schedule request:', request);
    this.isLoading.set(true);

    this.officeHoursService.createOfficeHours(request).subscribe({
      next: (response) => {
        console.log('[OfficeHours] Schedule created:', response);
        // Agregar a la lista local
        const current = this.schedules();
        this.schedules.set([...current, response]);
        
        // Limpiar campos
        this.selectedDate.set(null);
        this.startTime.set('');
        this.endTime.set('');
        this.isLoading.set(false);

        // Toast de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Horario agregado',
          detail: 'El horario de consulta fue agregado exitosamente',
          life: 3000
        });
      },
      error: (error) => {
        console.error('[OfficeHours] Error creating schedule:', error);
        this.isLoading.set(false);

        // Toast de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar el horario de consulta',
          life: 3000
        });
      }
    });
  }

  // Helper para formatear horario en el template
  formatSchedule(officeHours: OfficeHoursResponse): string {
    const date = new Date(officeHours.date);
    const formattedDate = date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${formattedDate} ${officeHours.startTime} - ${officeHours.endTime}`;
  }
}
