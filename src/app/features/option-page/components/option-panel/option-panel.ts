import { ChangeDetectionStrategy, Component, input, inject, signal, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { OptionCardComponent } from '../option-card/option-card';
import { Skeleton } from 'primeng/skeleton';

type UserType = 'student' | 'teacher' | 'analyst';

@Component({
  selector: 'app-option-panel',
  imports: [OptionCardComponent, Skeleton],
  templateUrl: './option-panel.html',
  styleUrl: './option-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionPanel implements OnInit {
  readonly mainMenu = input<boolean>(false);
  readonly userType = input<UserType>('teacher');
  readonly isLoading = signal(true);
  private readonly router = inject(Router);

  constructor() {
 
    effect(() => {
      this.mainMenu();  
      this.isLoading.set(true);
      setTimeout(() => {
        this.isLoading.set(false);
      }, 500);
    });
  }

  ngOnInit(): void {
 
  }

  handleButtonClick(action: string): void {
    const currentUserType = this.userType();
    
    if (action === 'planificador') {
      this.router.navigate(['/course-catalog'], { queryParams: { docente: true, mode: 'planner' } });
    } else if (action === 'estadistico') {
 
      const docenteParam = currentUserType === 'teacher';
      this.router.navigate(['/course-catalog'], { queryParams: { docente: docenteParam, mode: 'statistics' } });
    } else if (action === 'asignar-cursos') {
      this.router.navigate(['/option-page'], { queryParams: { mainMenu: false } });
    } else if (action === 'itr') {
      this.router.navigate(['/option-page'], { queryParams: { mainMenu: false } });
    } else if (action === 'chat') {
      this.router.navigate(['/chat-page']);
    } else if (action === 'info-cursos') {
      this.router.navigate(['/course-catalog'], { queryParams: { docente: false, mode: 'info' } });
    } else if (action === 'crear-cursos') {
      this.router.navigate(['/option-page'], { queryParams: { mainMenu: false } });
    }
  }

  handleItrClick(itrName: string): void {
    this.router.navigate(['/assign-page'], { queryParams: { itr: itrName } });
  }
}