import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChatHeader } from './components/chat-header/chat-header';
import { ChatBody } from './components/chat-body/chat-body';
import { ChatInput } from './components/chat-input/chat-input';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { SectionHeader } from '@app/layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';

@Component({
  selector: 'app-chat-page',
  imports: [ChatHeader, ChatBody, ChatInput, ColorBlock, SectionHeader],
  templateUrl: './chat-page.html',
  styleUrls: ['./chat-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPage {
  readonly InfoType = InfoType;
}
