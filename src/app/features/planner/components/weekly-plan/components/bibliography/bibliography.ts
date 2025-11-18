import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-bibliography',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './bibliography.html',
  styleUrl: './bibliography.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Bibliography {
  references = input<string[]>([]);
  
  // Outputs para comunicar acciones al componente padre
  addReference = output<string>();
  deleteReference = output<string>();
  
  // Estado local
  newReference = signal('');
  isAdding = signal(false);
  
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
      alert('La referencia no puede superar los 500 caracteres');
      return;
    }
    
    if (this.references().includes(reference)) {
      alert('Esta referencia ya existe');
      return;
    }
    
    this.addReference.emit(reference);
    this.isAdding.set(false);
    this.newReference.set('');
  }
  
  onDeleteReference(reference: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta referencia?')) {
      this.deleteReference.emit(reference);
    }
  }
}

