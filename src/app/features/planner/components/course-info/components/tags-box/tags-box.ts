import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Selector } from '@app/shared/components/select/select';
import { EnumResponse } from '@app/core/services';

@Component({
  selector: 'app-tags-box',
  imports: [CommonModule, Dialog, Button, Selector],
  templateUrl: './tags-box.html',
  styleUrl: './tags-box.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsBox {
  title = input.required<string>();
  tags = input<string[]>([]);
  enumOptions = input<EnumResponse[]>([]);
  
  onRemoveTag = output<string>();
  onAddTag = output<string>();
  
  showModal = signal(false);
  selectedValue = signal<string | undefined>(undefined);
  
  openModal(): void {
    this.showModal.set(true);
    this.selectedValue.set(undefined);
  }
  
  closeModal(): void {
    this.showModal.set(false);
    this.selectedValue.set(undefined);
  }
  
  removeTag(tag: string): void {
    this.onRemoveTag.emit(tag);
  }
  
  onSelectChange(value: string): void {
    this.selectedValue.set(value);
  }
  
  addNewTag(): void {
    const value = this.selectedValue();
    if (value) {
      this.onAddTag.emit(value);
      this.closeModal();
    }
  }
}
