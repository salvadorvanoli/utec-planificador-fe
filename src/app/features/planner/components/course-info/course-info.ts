import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { Selector } from '@app/shared/components/select/select';

@Component({
  selector: 'app-course-info',
  imports: [FloatLabel, Selector, InputTextModule, FormsModule, Skeleton],
  templateUrl: './course-info.html',
  styleUrl: './course-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseInfo {
 
  description = signal<string>('');
  isLoading = signal(true);

  constructor() {
 
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }
}
