import { ChangeDetectionStrategy, effect, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-course-card',
  imports: [CheckboxModule, FormsModule],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCard {
  checked = signal(false);
  readonly assign = input<boolean>(false);
  readonly assignState = signal(this.assign());

  constructor() {
    effect(() => {
      this.assignState.set(this.assign());
    });
  }
}