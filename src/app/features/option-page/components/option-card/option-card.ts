import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-option-card',
  templateUrl: './option-card.html',
  styleUrls: ['./option-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionCardComponent {
  @Input() icon: string = 'pi pi-calendar';
  @Input() title: string = 'Planificador';
  @Input() description: string = 'Organiza y planifica tus actividades académicas';
}
