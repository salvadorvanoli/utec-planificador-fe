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
  startDate = input<string>('');
  endDate = input<string>('');
  onWeekChange = output<number>();
  onDateRangeChange = output<{ startDate: string; endDate: string }>();
  
  handleWeekChange(newWeek: number): void {
    this.onWeekChange.emit(newWeek);
  }
  
  handleDateRangeChange(dateRange: { startDate: string; endDate: string }): void {
    this.onDateRangeChange.emit(dateRange);
  }
}
