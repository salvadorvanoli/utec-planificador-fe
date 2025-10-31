import { ChangeDetectionStrategy, effect, Component, input, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, ActivatedRoute } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';

type NavigationMode = 'planner' | 'statistics' | 'info' | 'none';

@Component({
  selector: 'app-course-card',
  imports: [CheckboxModule, FormsModule, Skeleton],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'handleCardClick()'
  }
})
export class CourseCard {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  checked = signal(false);
  readonly assign = input<boolean>(false);
  readonly docente = input<boolean>(false);
  readonly assignState = signal(this.assign());
  isLoading = signal(true);
  private navigationMode = signal<NavigationMode>('none');
  
  shouldShowPdfIcon = () => this.navigationMode() === 'info';

  constructor() {
    effect(() => {
      this.assignState.set(this.assign());
    });

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      
      if (mode === 'planner') {
        this.navigationMode.set('planner');
      } else if (mode === 'statistics') {
        this.navigationMode.set('statistics');
      } else if (mode === 'info') {
        this.navigationMode.set('info');
      } else {
        const isDocente = this.docente();
        this.navigationMode.set(isDocente ? 'planner' : 'none');
      }
    });
  }

  handleCardClick(): void {
    const mode = this.navigationMode();
    
    if (mode === 'planner') {
      this.router.navigate(['/planner']);
    } else if (mode === 'statistics') {
      this.router.navigate(['/statistics-page']);
    }
  }

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500);
  }
}