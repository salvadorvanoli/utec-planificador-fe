import { Component, ChangeDetectionStrategy, input, effect, viewChild, ElementRef } from '@angular/core';
import { SentMessage } from '../sent-message/sent-message';
import { ChatMessage } from '@app/core/models';

@Component({
  selector: 'app-chat-body',
  imports: [SentMessage],
  templateUrl: './chat-body.html',
  styleUrl: './chat-body.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatBody {
  readonly messages = input<ChatMessage[]>([]);
  readonly chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  constructor() {
    effect(() => {
      // Trigger scroll when messages change
      const msgs = this.messages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  private scrollToBottom(): void {
    const container = this.chatContainer();
    if (container?.nativeElement) {
      container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
    }
  }
}
