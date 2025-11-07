import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-activity-bullet',
  imports: [],
  templateUrl: './activty-bullet.html',
  styleUrl: './activty-bullet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--colour]': 'colour()'
  }
})
export class ActivtyBullet {
  readonly id = input.required<number>();
  readonly title = input<string>('Título por defecto');
  readonly content = input<string>('Contenido por defecto');
  readonly colour = input<string>('#3b82f6');
  
  readonly onDelete = output<number>();
  readonly onEdit = output<number>();
  
  handleDelete(): void {
    console.log('[ActivityBullet] Delete clicked for activity:', this.id());
    this.onDelete.emit(this.id());
  }
  
  handleEdit(): void {
    console.log('[ActivityBullet] Edit clicked for activity:', this.id());
    this.onEdit.emit(this.id());
  }
}
