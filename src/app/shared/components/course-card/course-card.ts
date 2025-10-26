import { ChangeDetectionStrategy, effect, Component, input, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-course-card',
  imports: [CheckboxModule, FormsModule, Skeleton],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'navigateToPlanner()'
  }
})
export class CourseCard {
  private readonly router = inject(Router);

  checked = signal(false);
  readonly assign = input<boolean>(false);
  readonly assignState = signal(this.assign());
  isLoading = signal(true);

  constructor() {
    effect(() => {
      this.assignState.set(this.assign());
    });
  }

  navigateToPlanner(): void {
    this.router.navigate(['/planner']);
  }

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500);
  }
}