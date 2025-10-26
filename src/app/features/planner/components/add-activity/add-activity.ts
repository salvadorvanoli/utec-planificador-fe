import { ChangeDetectionStrategy, Component, input, output, effect } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Selector } from '@app/shared/components/select/select';
import { ButtonComponent } from '@app/shared/components/button/button';
@Component({
  selector: 'app-add-activity',
  imports: [DialogModule, InputTextModule, FormsModule, FloatLabel, Selector, ButtonComponent],
  templateUrl: './add-activity.html',
  styleUrl: './add-activity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddActivity {
  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  value2: string | undefined;

  constructor() {
    console.log('AddActivity instantiated');
    // log whenever visible() changes
    effect(() => {
      console.log('AddActivity.visible =>', this.visible());
    });
  }
}


