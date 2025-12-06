import { Component, input, output, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bibliography',
  imports: [FormsModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './bibliography.html',
  styleUrl: './bibliography.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Bibliography {
  private readonly messageService = inject(MessageService);
  references = input<string[]>([]);
  isDisabled = input<boolean>(false);
  isReadOnly = input<boolean>(false); // Controls if add/delete buttons are disabled
  
  // Outputs para comunicar acciones al componente padre
  addReference = output<string>();
  deleteReference = output<string>();
  
  // Estado local
  newReference = signal('');
  isAdding = signal(false);
  showDeleteModal = signal(false);
  referenceToDelete = signal<string | null>(null);
  
  startAdding(): void {
    this.isAdding.set(true);
    this.newReference.set('');
  }
  
  cancelAdding(): void {
    this.isAdding.set(false);
    this.newReference.set('');
  }
  
  onAddReference(): void {
    const reference = this.newReference().trim();
    
    if (!reference) {
      return;
    }
    
    if (reference.length > 500) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'La referencia no puede superar los 500 caracteres'
      });
      return;
    }
    
    if (this.references().includes(reference)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Esta referencia ya existe'
      });
      return;
    }
    
    this.addReference.emit(reference);
    this.isAdding.set(false);
    this.newReference.set('');
  }
  
  onDeleteReference(reference: string): void {
    this.referenceToDelete.set(reference);
    this.showDeleteModal.set(true);
  }

  confirmDeleteReference(): void {
    const reference = this.referenceToDelete();
    if (reference) {
      this.deleteReference.emit(reference);
      this.showDeleteModal.set(false);
      this.referenceToDelete.set(null);
    }
  }

  cancelDeleteReference(): void {
    this.showDeleteModal.set(false);
    this.referenceToDelete.set(null);
  }
}

