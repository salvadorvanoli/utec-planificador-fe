import { Component } from '@angular/core';
import { SentMessage } from '../sent-message/sent-message';

@Component({
  selector: 'app-chat-body',
  imports: [SentMessage],
  templateUrl: './chat-body.html',
  styleUrl: './chat-body.scss'
})
export class ChatBody {

}
