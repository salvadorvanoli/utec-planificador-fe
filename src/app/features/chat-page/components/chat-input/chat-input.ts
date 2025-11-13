import { Component, ChangeDetectionStrategy, signal, output, input, viewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInput {
  readonly message = signal<string>('');
  readonly isSending = input<boolean>(false);
  readonly sendMessage = output<string>();
  readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textareaRef');

  private readonly minHeight = 48;
  private readonly maxHeight = 200;

  constructor() {
    effect(() => {
      this.message();
      setTimeout(() => this.adjustTextareaHeight(), 0);
    });
  }

  onSendClick(): void {
    const msg = this.message().trim();
    if (msg && !this.isSending()) {
      this.sendMessage.emit(msg);
      this.message.set('');
      setTimeout(() => this.resetTextareaHeight(), 0);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendClick();
    }
  }

  onInput(): void {
    this.adjustTextareaHeight();
  }

  private adjustTextareaHeight(): void {
    const textareaEl = this.textarea();
    if (textareaEl?.nativeElement) {
      const element = textareaEl.nativeElement;
      element.style.height = 'auto';

      const newHeight = Math.min(Math.max(element.scrollHeight, this.minHeight), this.maxHeight);
      element.style.height = `${newHeight}px`;

      element.style.overflowY = element.scrollHeight > this.maxHeight ? 'auto' : 'hidden';
    }
  }

  private resetTextareaHeight(): void {
    const textareaEl = this.textarea();
    if (textareaEl?.nativeElement) {
      const element = textareaEl.nativeElement;
      element.style.height = `${this.minHeight}px`;
      element.style.overflowY = 'hidden';
    }
  }
}

