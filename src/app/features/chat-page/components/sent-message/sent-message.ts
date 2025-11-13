import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface FormattedLine {
  type: 'title' | 'section' | 'bullet' | 'text' | 'empty';
  content: string;
}

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

  readonly formattedLines = computed(() => {
    const text = this.text();
    if (!text) return [];

    const lines = text.split('\n');
    const formatted: FormattedLine[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        formatted.push({ type: 'empty', content: '' });
      } else if (trimmed.startsWith('📊') || trimmed.startsWith('🎯')) {
        formatted.push({ type: 'title', content: trimmed });
      } else if (trimmed.startsWith('📋') || trimmed.startsWith('💡') ||
                 trimmed.startsWith('📈') || trimmed.startsWith('🔍')) {
        formatted.push({ type: 'section', content: trimmed });
      } else if (trimmed.match(/^\d+\)/)) {
        formatted.push({ type: 'bullet', content: trimmed });
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        formatted.push({ type: 'bullet', content: trimmed.substring(1).trim() });
      } else {
        formatted.push({ type: 'text', content: line });
      }
    }

    return formatted;
  });
}
