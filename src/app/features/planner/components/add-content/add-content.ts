import { ChangeDetectionStrategy, Component, input, output, effect, signal, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@app/shared/components/button/button';
import { CommonModule } from '@angular/common';
import { ColorPicker } from '../color-picker/color-picker';
import { ProgrammaticContentService, ProgrammaticContentRequest } from '@app/core/services/programmatic-content.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-content',
  imports: [DialogModule, InputTextModule, FormsModule, FloatLabel, ButtonComponent, CommonModule, ColorPicker],
  templateUrl: './add-content.html',
  styleUrl: './add-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddContent {
  private readonly programmaticContentService = inject(ProgrammaticContentService);
  private readonly messageService = inject(MessageService);

  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  
  // Input para recibir el weeklyPlanningId desde el componente padre
  readonly weeklyPlanningId = input.required<number>();
  
  // Input para recibir el ID del contenido a editar (null para crear nuevo)
  readonly contentId = input<number | null>(null);
  
  // Input para modo readonly (solo visualización)
  readonly isReadOnly = input<boolean>(false);
  
  // Output para notificar cuando se crea o edita un contenido
  readonly onContentCreated = output<void>();
  
  // Form fields
  title = signal<string>('');
  content = signal<string>('');
  selectedColor = signal<string>('#F8BBD0'); 
  
  // Flag para indicar si se está guardando
  isSaving = signal<boolean>(false);
  
  isEditMode = signal<boolean>(false);

  constructor() {
    console.log('[AddContent] Component instantiated');
    
    effect(() => {
      if (this.visible()) {
        console.log('[AddContent] Modal opened');
        
        // Si hay contentId, cargar los datos del contenido
        const contId = this.contentId();
        if (contId !== null) {
          console.log('[AddContent] Edit mode, loading content:', contId);
          this.isEditMode.set(true);
          this.loadContentData(contId);
        } else {
          console.log('[AddContent] Create mode');
          this.isEditMode.set(false);
        }
      } else {
        this.resetForm();
      }
    });
  }
  
  loadContentData(id: number): void {
    this.programmaticContentService.getProgrammaticContentById(id).subscribe({
      next: (contentData) => {
        console.log('[AddContent] Content data loaded:', contentData);
        this.title.set(contentData.title);
        this.content.set(contentData.content);
        this.selectedColor.set(contentData.color);
      },
      error: (error) => {
        console.error('[AddContent] Error loading content data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo cargar los datos del contenido'
        });
      }
    });
  }
  
  onColorChange(color: string): void {
    this.selectedColor.set(color);
    console.log('[AddContent] Color changed to:', color);
  }
  
  saveContent(): void {
    // Block operation in read-only mode
    if (this.isReadOnly()) {
      console.warn('[AddContent] Cannot save content in read-only mode');
      return;
    }

    if (!this.title().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El título del contenido es obligatorio'
      });
      return;
    }

    if (!this.content().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'La descripción del contenido es obligatoria'
      });
      return;
    }

    this.isSaving.set(true);

    const request: ProgrammaticContentRequest = {
      title: this.title().trim(),
      content: this.content().trim(),
      color: this.selectedColor(),
      weeklyPlanningId: this.weeklyPlanningId()
    };

    const contId = this.contentId();
    const isEdit = contId !== null;

    console.log(`[AddContent] ${isEdit ? 'Updating' : 'Creating'} content with data:`, request);

    const operation$ = isEdit
      ? this.programmaticContentService.updateProgrammaticContent(contId, request)
      : this.programmaticContentService.createProgrammaticContent(request);

    operation$.subscribe({
      next: (response) => {
        console.log(`[AddContent] Content ${isEdit ? 'updated' : 'created'} successfully:`, response);
        this.messageService.add({
          severity: 'success',
          summary: isEdit ? 'Contenido actualizado' : 'Contenido creado',
          detail: `El contenido programático se ha ${isEdit ? 'actualizado' : 'creado'} exitosamente`
        });
        this.isSaving.set(false);
        this.visibleChange.emit(false);
        this.onContentCreated.emit();
      },
      error: (error) => {
        console.error(`[AddContent] Error ${isEdit ? 'updating' : 'creating'} content:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || `No se pudo ${isEdit ? 'actualizar' : 'crear'} el contenido programático`
        });
        this.isSaving.set(false);
      }
    });
  }
  
  resetForm(): void {
    this.title.set('');
    this.content.set('');
    this.selectedColor.set('#F8BBD0'); 
    this.isSaving.set(false);
    this.isEditMode.set(false);
    console.log('[AddContent] Form reset');
  }
}
