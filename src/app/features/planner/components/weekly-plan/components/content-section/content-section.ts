import { Component, input, output } from '@angular/core';
import { CardContainer } from '../card-container/card-container';
import { ContentCard } from '../content-card/content-card';
import { ButtonComponent } from '@app/shared/components/button/button';
import { ProgrammaticContent } from '@app/core/models';

@Component({
  selector: 'app-content-section',
  imports: [CardContainer, ContentCard, ButtonComponent],
  templateUrl: './content-section.html',
  styleUrl: './content-section.scss'
})
export class ContentSection {
  contents = input<ProgrammaticContent[]>([]);
  selectedContentId = input<number | null>(null);
  onContentSelect = output<ProgrammaticContent>();
  
  selectContent(content: ProgrammaticContent): void {
    this.onContentSelect.emit(content);
  }
}
