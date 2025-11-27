import { Component, input, output, computed } from '@angular/core';
import { WeekPicker } from '../week-picker/week-picker';

@Component({
  selector: 'app-week-title',
  imports: [WeekPicker],
  templateUrl: './week-title.html',
  styleUrl: './week-title.scss'
})
export class WeekTitle {
  weekNumber = input<number>(1);
  startDate = input<string>(''); // Fecha inicio de la semana actual
  endDate = input<string>(''); // Fecha fin de la semana actual
  courseStartDate = input<string>(''); // Fecha inicio del curso
  courseEndDate = input<string>(''); // Fecha fin del curso
  onWeekChange = output<number>();
  onDateRangeChange = output<{ startDate: string; endDate: string }>();
  
  // Calcular el número máximo de semanas del curso
  maxWeekNumber = computed(() => {
    const startStr = this.courseStartDate();
    const endStr = this.courseEndDate();
    
    if (!startStr || !endStr) return 999; // Si no hay fechas, no limitar
    
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    
    // Calcular la diferencia en días
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calcular el número de semanas (redondeando hacia arriba)
    const weeks = Math.ceil((diffDays + 1) / 7);
    
    return weeks;
  });
  
  handleWeekChange(newWeek: number): void {
    this.onWeekChange.emit(newWeek);
  }
  
  handleDateRangeChange(dateRange: { startDate: string; endDate: string }): void {
    this.onDateRangeChange.emit(dateRange);
  }
}
