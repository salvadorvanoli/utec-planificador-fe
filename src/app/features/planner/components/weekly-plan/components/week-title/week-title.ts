import { Component, input, output } from '@angular/core';
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
  
  handleWeekChange(newWeek: number): void {
    this.onWeekChange.emit(newWeek);
  }
  
  handleDateRangeChange(dateRange: { startDate: string; endDate: string }): void {
    this.onDateRangeChange.emit(dateRange);
  }
}
