import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.html',
  styleUrl: './content-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--activity-bg]': 'color()',
    '[class.selected]': 'isSelected()',
    'style': 'cursor: pointer;'
  }
})
export class ContentCard {
  readonly id = input.required<number>();
  readonly color = input<string>('#ffffff');
  readonly titulo = input<string>('Título por defecto');
  readonly descripcion = input<string>('Descripción por defecto');
  readonly isSelected = input<boolean>(false);
  readonly isReadOnly = input<boolean>(false);
  
  readonly onDelete = output<number>();
  readonly onEdit = output<number>();
  
  handleDelete(event: Event): void {
    event.stopPropagation();
    console.log('[ContentCard] Delete clicked for content:', this.id());
    this.onDelete.emit(this.id());
  }
  
  handleEdit(event: Event): void {
    event.stopPropagation();
    console.log('[ContentCard] Edit clicked for content:', this.id());
    this.onEdit.emit(this.id());
  }
}
