import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sent-message',
  templateUrl: './sent-message.html',
  styleUrl: './sent-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentMessage {
  readonly bot = input<boolean>(false);
  readonly text = input<string>('');
  readonly inProgress = input<boolean>(false);

  readonly borderRadius = computed(() =>
    this.bot()
      ? '15px 15px 15px 0px'
      : '15px 15px 0px 15px'
  );
}
