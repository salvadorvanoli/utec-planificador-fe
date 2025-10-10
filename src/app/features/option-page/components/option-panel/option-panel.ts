import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { ColorBlock } from '../../../../shared/components/color-block/color-block';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-option-panel',
  imports: [ColorBlock, ButtonComponent],
  templateUrl: './option-panel.html',
  styleUrl: './option-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionPanel {
  readonly mainMenu = input<boolean>(false);
  private readonly router = inject(Router);

  handleButtonClick(action: string): void {
    if (action === 'planificador') {
      this.router.navigate(['/course-catalog'], { queryParams: { alumno: false } });
    } else if (action === 'estadistico') {
      this.router.navigate(['/statistics-page']);
    } else if (action === 'asignar-cursos') {
      this.router.navigate(['/assign-page']);
    } else if (action === 'itr') {
      this.router.navigate(['/option-page'], { queryParams: { mainMenu: false } });
    }
  }
}