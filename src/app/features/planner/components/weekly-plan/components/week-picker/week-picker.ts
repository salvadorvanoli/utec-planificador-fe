import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-week-picker',
  imports: [FormsModule, DatePicker],
  templateUrl: './week-picker.html',
  styleUrl: './week-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekPicker {
  selectedWeek = signal<Date[]>([]);
  hoveredWeek = signal<Date[]>([]);

  onDateSelect(date: Date) {
    const day = date.getDay(); 
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    this.selectedWeek.set([monday, sunday]);
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
