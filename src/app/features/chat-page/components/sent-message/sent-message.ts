import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, input, signal, effect, OnDestroy, inject } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-sent-message',
  templateUrl: './sent-message.html',
  styleUrl: './sent-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentMessage implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly bot = input<boolean>(false);
  readonly text = input<string>('');
  readonly inProgress = input<boolean>(false);

  readonly displayedText = signal<string>('');
  readonly isTyping = signal<boolean>(false);

  private typingInterval: any = null;
  private lastProcessedText = '';
  private fullTextToShow = '';

  readonly borderRadius = computed(() =>
    this.bot()
      ? '15px 15px 15px 0px'
      : '15px 15px 0px 15px'
  );

  readonly htmlContent = computed((): SafeHtml => {
    const content = this.displayedText() || this.text();
    if (!content) return '';

    try {
      marked.setOptions({
        breaks: true,
        gfm: true
      });

      const html = marked.parse(content) as string;
      return this.sanitizer.sanitize(1, html) || '';
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return content;
    }
  });

  constructor() {
    effect(() => {
      const text = this.text();
      const isBot = this.bot();
      const inProg = this.inProgress();

      if (isBot && text && !inProg && text !== this.lastProcessedText) {
        this.lastProcessedText = text;
        this.startTypingEffect(text);
      } else if (!isBot) {
        this.displayedText.set(text);
        this.lastProcessedText = text;
        this.cdr.markForCheck();
      } else if (inProg) {
        this.displayedText.set('');
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTypingInterval();
  }

  onMessageClick(event?: Event): void {
    if (this.isTyping() && this.fullTextToShow) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }

      this.clearTypingInterval();
      this.displayedText.set(this.fullTextToShow);
      this.isTyping.set(false);
      this.fullTextToShow = '';
      this.cdr.markForCheck();
    }
  }

  private startTypingEffect(fullText: string): void {
    this.clearTypingInterval();
    this.isTyping.set(true);
    this.displayedText.set('');
    this.fullTextToShow = fullText;
    this.cdr.markForCheck();

    let currentIndex = 0;
    const speed = 0.1;

    this.typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        this.displayedText.update(current => current + fullText[currentIndex]);
        currentIndex++;
        this.cdr.markForCheck();
      } else {
        this.clearTypingInterval();
        this.isTyping.set(false);
        this.fullTextToShow = '';
        this.cdr.markForCheck();
      }
    }, speed);
  }

  private clearTypingInterval(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }
}

