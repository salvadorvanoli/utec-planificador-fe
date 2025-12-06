import { Component, input, output, signal } from '@angular/core';
import { CardContainer } from '../card-container/card-container';
import { ContentCard } from '../content-card/content-card';
import { ButtonComponent } from '@app/shared/components/button/button';
import { ProgrammaticContent } from '@app/core/models';
import { AddContent } from '../../../add-content/add-content';

@Component({
  selector: 'app-content-section',
  imports: [CardContainer, ContentCard, ButtonComponent, AddContent],
  templateUrl: './content-section.html',
  styleUrl: './content-section.scss'
})
export class ContentSection {
  contents = input<ProgrammaticContent[]>([]);
  selectedContentId = input<number | null>(null);
  weeklyPlanningId = input.required<number>();
  isReadOnly = input<boolean>(false); // Controls if create/edit/delete buttons are disabled
  
  onContentSelect = output<ProgrammaticContent>();
  onContentCreated = output<void>();
  onContentDeleted = output<number>();
  
  modalVisible = signal(false);
  editingContentId = signal<number | null>(null);
  
  selectContent(content: ProgrammaticContent): void {
    this.onContentSelect.emit(content);
  }
  
  openModal(): void {
    console.log('[ContentSection] openModal called - Create mode');
    this.editingContentId.set(null);
    this.modalVisible.set(true);
  }
  
  handleContentCreated(): void {
    console.log('[ContentSection] Content created/updated, notifying parent');
    this.onContentCreated.emit();
  }
  
  handleDelete(contentId: number): void {
    console.log('[ContentSection] Delete requested for content:', contentId);
    this.onContentDeleted.emit(contentId);
  }
  
  handleEdit(contentId: number): void {
    console.log('[ContentSection] Edit requested for content:', contentId);
    this.editingContentId.set(contentId);
    this.modalVisible.set(true);
  }
}
