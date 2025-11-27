import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-datepicker',
  imports: [DatePicker, FormsModule],
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent {
  // Input properties
  label = input.required<string>();
  placeholder = input<string>('');
  dateFormat = input<string>('dd/mm/yy');
  disabled = input<boolean>(false);
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);
  readonlyInput = input<boolean>(false);
  invalid = input<boolean>(false);
  id = input<string>('');
  showOnFocus = input<boolean>(true);
  
  // Two-way binding for the selected date
  selectedDate = model<Date | null>(null);
  
  // Output event when date changes
  onDateChange = output<Date | null>();
}
