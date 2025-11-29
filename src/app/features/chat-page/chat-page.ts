import { Component, ChangeDetectionStrategy, signal, inject, viewChild } from '@angular/core';
import { ChatHeader } from './components/chat-header/chat-header';
import { ChatBody } from './components/chat-body/chat-body';
import { ChatInput } from './components/chat-input/chat-input';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { SectionHeader } from '@app/layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { AiAgentService } from '@app/core/services';
import { ChatMessage } from '@app/core/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  imports: [ChatHeader, ChatBody, ChatInput, ColorBlock, SectionHeader],
  templateUrl: './chat-page.html',
  styleUrls: ['./chat-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPage {
  private readonly aiAgentService = inject(AiAgentService);

  readonly InfoType = InfoType;
  readonly messages = signal<ChatMessage[]>([]);
  readonly isSending = signal<boolean>(false);

  readonly chatHeader = viewChild(ChatHeader);

  onSendMessage(messageText: string): void {
    if (!messageText.trim() || this.isSending()) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMessage]);

    // Add bot "thinking" message
    const thinkingMessage: ChatMessage = {
      text: '',
      isBot: true,
      timestamp: new Date(),
      inProgress: true
    };
    this.messages.update(msgs => [...msgs, thinkingMessage]);

    this.isSending.set(true);

    // Get course ID from header if available
    const courseId = this.chatHeader()?.selectedCourse()?.id;

    this.aiAgentService.chat({
      message: messageText,
      courseId: courseId
    })
      .pipe(finalize(() => this.isSending.set(false)))
      .subscribe({
        next: (response) => {
          // Remove thinking message and add actual response
          this.messages.update(msgs => {
            const filtered = msgs.filter(m => !m.inProgress);
            const botMessage: ChatMessage = {
              text: response.reply,
              isBot: true,
              timestamp: new Date()
            };
            return [...filtered, botMessage];
          });
        },
        error: (error) => {
          console.error('Error sending message:', error);
          // Remove thinking message and add error message
          this.messages.update(msgs => {
            const filtered = msgs.filter(m => !m.inProgress);
            const errorMessage: ChatMessage = {
              text: error.error?.message || 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta nuevamente.',
              isBot: true,
              timestamp: new Date()
            };
            return [...filtered, errorMessage];
          });
        }
      });
  }

  onShowSuggestions(data: { courseId: number; courseName: string } | any): void {
    // Add bot "thinking" message for suggestions
    const thinkingMessage: ChatMessage = {
      text: '',
      isBot: true,
      timestamp: new Date(),
      inProgress: true
    };
    this.messages.update(msgs => [...msgs, thinkingMessage]);

    let resolvedCourseId: number | undefined = undefined;
    let resolvedCourseName: string | undefined = undefined;

    if (data && typeof data === 'object') {
      resolvedCourseId = data.courseId;
      resolvedCourseName = data.courseName;
    }

    this.isSending.set(true);

    if (resolvedCourseId == null) {
      console.warn('No courseId could be resolved for suggestions request. Aborting.');
      this.messages.update(msgs => {
        const filtered = msgs.filter(m => !m.inProgress);
        const errorMessage: ChatMessage = {
          text: 'No se pudo identificar el curso seleccionado. Por favor, selecciona un curso e intenta nuevamente.',
          isBot: true,
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });

      this.isSending.set(false);
      return;
    }

    this.aiAgentService.getSuggestions({ courseId: resolvedCourseId })
      .pipe(finalize(() => this.isSending.set(false)))
      .subscribe({
        next: (response) => {
          // Remove thinking message and add suggestions
          this.messages.update(msgs => {
            const filtered = msgs.filter(m => !m.inProgress);

            const suggestionMessage: ChatMessage = {
              text: this.formatSuggestions(resolvedCourseName ?? '', response.analysis, response.pedagogicalSuggestions),
              isBot: true,
              timestamp: new Date()
            };
            return [...filtered, suggestionMessage];
          });
        },
        error: (error) => {
          console.error('Error getting suggestions:', error);
          this.messages.update(msgs => {
            const filtered = msgs.filter(m => !m.inProgress);
            const errorMessage: ChatMessage = {
              text: error.error?.message || 'Lo siento, ha ocurrido un error al obtener las sugerencias. Por favor, intenta nuevamente.',
              isBot: true,
              timestamp: new Date()
            };
            return [...filtered, errorMessage];
          });
        }
      });
  }

  onSessionCleared(): void {
    this.messages.set([]);
  }

  private formatSuggestions(courseName: string, analysis: string, suggestions: string): string {
    return `📊 SUGERENCIAS PEDAGÓGICAS PARA: ${courseName}\n\n` +
           `📋 ANÁLISIS:\n${analysis}\n\n` +
           `💡 SUGERENCIAS:\n${suggestions}`;
  }
}
