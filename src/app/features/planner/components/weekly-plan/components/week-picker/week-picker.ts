import { ChangeDetectionStrategy, Component, signal, input, effect, output } from '@angular/core';
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
  // Inputs para recibir el rango de fechas desde el padre
  startDate = input<string>(''); // formato YYYY-MM-DD
  endDate = input<string>(''); // formato YYYY-MM-DD
  
  // Output para emitir cuando el usuario seleccione una nueva semana
  onWeekChange = output<{ startDate: string; endDate: string }>();
  
  selectedWeek = signal<Date[]>([]);
  hoveredWeek = signal<Date[]>([]);

  constructor() {
    // Effect para actualizar selectedWeek cuando cambien los inputs
    effect(() => {
      const start = this.startDate();
      const end = this.endDate();
      
      if (start && end) {
        const startDateObj = new Date(start + 'T00:00:00');
        const endDateObj = new Date(end + 'T00:00:00');
        this.selectedWeek.set([startDateObj, endDateObj]);
        console.log('[WeekPicker] Week set:', { start, end, dates: [startDateObj, endDateObj] });
      }
    });
  }

  onDateSelect(date: Date) {
    const day = date.getDay(); 
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

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
