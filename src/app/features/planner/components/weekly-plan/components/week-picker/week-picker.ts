import { ChangeDetectionStrategy, Component, signal, input, effect, output, computed } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';

@Component({
  selector: 'app-week-picker',
  imports: [FormsModule, DatePicker],
  templateUrl: './week-picker.html',
  styleUrl: './week-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekPicker {
  private readonly messageService = inject(MessageService);
  
  // Inputs para recibir las fechas de la semana actual
  weekStartDate = input<string>(''); // formato YYYY-MM-DD
  weekEndDate = input<string>(''); // formato YYYY-MM-DD
  
  // Inputs para recibir las fechas del curso (límites del datepicker)
  courseStartDate = input<string>(''); // formato YYYY-MM-DD
  courseEndDate = input<string>(''); // formato YYYY-MM-DD
  
  // Output para emitir cuando el usuario seleccione una nueva semana
  onWeekChange = output<{ startDate: string; endDate: string }>();
  
  selectedWeek = signal<Date[]>([]);
  hoveredWeek = signal<Date[]>([]);

  // Computed para las fechas mínima y máxima del curso
  minDate = computed(() => {
    const dateStr = this.courseStartDate();
    return dateStr ? new Date(dateStr + 'T00:00:00') : undefined;
  });

  maxDate = computed(() => {
    const dateStr = this.courseEndDate();
    return dateStr ? new Date(dateStr + 'T00:00:00') : undefined;
  });

  constructor() {
    // Effect para actualizar selectedWeek cuando cambien los inputs
    effect(() => {
      const start = this.weekStartDate();
      const end = this.weekEndDate();
      
      if (start && end) {
        const startDateObj = new Date(start + 'T00:00:00');
        const endDateObj = new Date(end + 'T00:00:00');
        this.selectedWeek.set([startDateObj, endDateObj]);
        console.log('[WeekPicker] Week set:', { start, end, dates: [startDateObj, endDateObj] });
      }
    });
  }

  onDateSelect(date: Date) {
    // Verificar si la fecha está fuera del rango del curso
    const min = this.minDate();
    const max = this.maxDate();
    
    if (min && date < min) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha inválida',
        detail: 'La fecha seleccionada está antes del inicio del curso'
      });
      return;
    }
    
    if (max && date > max) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha inválida',
        detail: 'La fecha seleccionada está después del fin del curso'
      });
      return;
    }
    
    const day = date.getDay(); 
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Verificar si la semana calculada está completamente dentro del rango
    if (min && monday < min) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Semana inválida',
        detail: 'La semana seleccionada comienza antes del inicio del curso'
      });
      return;
    }
    
    if (max && sunday > max) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Semana inválida',
        detail: 'La semana seleccionada termina después del fin del curso'
      });
      return;
    }

    this.selectedWeek.set([monday, sunday]);
    
    // Emitir el cambio al padre en formato YYYY-MM-DD
    const startDateStr = monday.toISOString().split('T')[0];
    const endDateStr = sunday.toISOString().split('T')[0];
    
    console.log('[WeekPicker] Week selected:', { startDateStr, endDateStr });
    this.onWeekChange.emit({ startDate: startDateStr, endDate: endDateStr });
  }

  onDayHover(date: Date) {
    const day = date.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    this.hoveredWeek.set([monday, sunday]);
  }

  onDayLeave() {
    this.hoveredWeek.set([]);
  }

  isInHoveredWeek(date: Date): boolean {
    const range = this.hoveredWeek();
    return range.length === 2 && date >= range[0] && date <= range[1];
  }
}
