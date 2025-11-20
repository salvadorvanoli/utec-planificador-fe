import { ChangeDetectionStrategy, Component, input, output, effect, signal, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Selector } from '@app/shared/components/select/select';
import { ButtonComponent } from '@app/shared/components/button/button';
import { CommonModule } from '@angular/common';
import { ColorPicker } from '../color-picker/color-picker';
import { EnumService, EnumResponse } from '@app/core/services/enum.service';
import { ActivityService, ActivityRequest } from '@app/core/services/activity.service';
import { MessageService } from 'primeng/api';
import { Multiselect } from '@app/shared/components/multiselect/multiselect';

@Component({
  selector: 'app-add-activity',
  imports: [DialogModule, InputTextModule, FormsModule, FloatLabel, Selector, ButtonComponent, CommonModule, ColorPicker, Multiselect],
  templateUrl: './add-activity.html',
  styleUrl: './add-activity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddActivity {
  private readonly enumService = inject(EnumService);
  private readonly activityService = inject(ActivityService);
  private readonly messageService = inject(MessageService);

  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  
  // Input para recibir el programmaticContentId desde el componente padre
  readonly programmaticContentId = input.required<number>();
  
  // Input para recibir el ID de la actividad a editar (null para crear nueva)
  readonly activityId = input<number | null>(null);
  
  // Output para notificar cuando se crea o edita una actividad
  readonly onActivityCreated = output<void>();
  
  // Form fields
  title = signal<string>('');
  objective = signal<string>('');
  description = signal<string>('');
  link = signal<string>('');
  durationInMinutes = signal<number | null>(null);
  selectedColor = signal<string>('#E53935'); 

  // Enum options
  cognitiveProcesses = signal<EnumResponse[]>([]);
  transversalCompetencies = signal<EnumResponse[]>([]);
  teachingStrategies = signal<EnumResponse[]>([]);
  learningResources = signal<EnumResponse[]>([]);
  learningModalities = signal<EnumResponse[]>([]);
  
  // Selected values - arrays para permitir múltiples selecciones
  selectedCognitiveProcesses = signal<string[]>([]);
  selectedTransversalCompetencies = signal<string[]>([]);
  selectedTeachingStrategies = signal<string[]>([]);
  selectedLearningResources = signal<string[]>([]);
  selectedLearningModality = signal<string>('');
  
  // Flag para indicar si se está guardando
  isSaving = signal<boolean>(false);
  
  isEditMode = signal<boolean>(false);

  constructor() {
    console.log('[AddActivity] Component instantiated');
    
    effect(() => {
      if (this.visible()) {
        console.log('[AddActivity] Modal opened, loading enums...');
        this.loadEnums();
        
        // Si hay activityId, cargar los datos de la actividad
        const actId = this.activityId();
        if (actId !== null) {
          console.log('[AddActivity] Edit mode, loading activity:', actId);
          this.isEditMode.set(true);
          this.loadActivityData(actId);
        } else {
          console.log('[AddActivity] Create mode');
          this.isEditMode.set(false);
          this.resetForm();
        }
      }
    });
  }
  
  private loadEnums(): void {
    // Load Cognitive Processes
    this.enumService.getCognitiveProcesses().subscribe({
      next: (data) => {
        this.cognitiveProcesses.set(data);
        console.log('[AddActivity] Cognitive processes loaded:', data.length);
      },
      error: (err) => console.error('[AddActivity] Error loading cognitive processes:', err)
    });

    // Load Transversal Competencies
    this.enumService.getTransversalCompetencies().subscribe({
      next: (data) => {
        this.transversalCompetencies.set(data);
        console.log('[AddActivity] Transversal competencies loaded:', data.length);
      },
      error: (err) => console.error('[AddActivity] Error loading transversal competencies:', err)
    });

    // Load Teaching Strategies
    this.enumService.getTeachingStrategies().subscribe({
      next: (data) => {
        this.teachingStrategies.set(data);
        console.log('[AddActivity] Teaching strategies loaded:', data.length);
      },
      error: (err) => console.error('[AddActivity] Error loading teaching strategies:', err)
    });

    // Load Learning Resources
    this.enumService.getLearningResources().subscribe({
      next: (data) => {
        this.learningResources.set(data);
        console.log('[AddActivity] Learning resources loaded:', data.length);
      },
      error: (err) => console.error('[AddActivity] Error loading learning resources:', err)
    });

    // Load Learning Modalities
    this.enumService.getLearningModalities().subscribe({
      next: (data) => {
        this.learningModalities.set(data);
        console.log('[AddActivity] Learning modalities loaded:', data.length);
      },
      error: (err) => console.error('[AddActivity] Error loading learning modalities:', err)
    });
  }
  
  private loadActivityData(activityId: number): void {
    console.log('[AddActivity] Loading activity data for ID:', activityId);
    this.activityService.getActivityById(activityId).subscribe({
      next: (activity) => {
        console.log('[AddActivity] Activity data loaded:', activity);
        
        // Cargar los datos en el formulario
        this.title.set(activity.title);
        this.description.set(activity.description);
        this.selectedColor.set(activity.color);
        this.durationInMinutes.set(activity.durationInMinutes);
        this.selectedLearningModality.set(activity.learningModality);
        
        // Cargar los arrays de enums
        this.selectedCognitiveProcesses.set(activity.cognitiveProcesses || []);
        this.selectedTransversalCompetencies.set(activity.transversalCompetencies || []);
        this.selectedTeachingStrategies.set(activity.teachingStrategies || []);
        this.selectedLearningResources.set(activity.learningResources || []);
      },
      error: (err) => {
        console.error('[AddActivity] Error loading activity data:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar los datos de la actividad'
        });
      }
    });
  }
  
  onColorChange(color: string): void {
    this.selectedColor.set(color);
    console.log('[AddActivity] Color changed to:', color);
  }
  
  saveActivity(): void {
    if (!this.title().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El título de la actividad es obligatorio'
      });
      return;
    }
    
    if (!this.description().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'La descripción de la actividad es obligatoria'
      });
      return;
    }
    
    if (!this.durationInMinutes() || this.durationInMinutes()! <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'La duración debe ser mayor a 0 minutos'
      });
      return;
    }
    
    if (!this.selectedLearningModality()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una modalidad'
      });
      return;
    }
    
    const request: ActivityRequest = {
      title: this.title(),
      description: this.description(),
      color: this.selectedColor(),
      durationInMinutes: this.durationInMinutes()!,
      learningModality: this.selectedLearningModality(),
      programmaticContentId: this.programmaticContentId(),
      cognitiveProcesses: this.selectedCognitiveProcesses(),
      transversalCompetencies: this.selectedTransversalCompetencies(),
      teachingStrategies: this.selectedTeachingStrategies(),
      learningResources: this.selectedLearningResources()
    };
    
    this.isSaving.set(true);
    
    const actId = this.activityId();
    const operation = actId !== null
      ? this.activityService.updateActivity(actId, request)
      : this.activityService.createActivity(request);
    
    const actionText = actId !== null ? 'actualizada' : 'creada';
    console.log(`[AddActivity] ${actId !== null ? 'Updating' : 'Creating'} activity:`, request);
    
    operation.subscribe({
      next: (response) => {
        console.log(`[AddActivity] Activity ${actionText} successfully:`, response);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Actividad ${actionText} correctamente`
        });
        
        this.resetForm();
        
        this.visibleChange.emit(false);
        
        this.onActivityCreated.emit();
        
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error(`[AddActivity] Error ${actId !== null ? 'updating' : 'creating'} activity:`, err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${actId !== null ? 'actualizar' : 'crear'} la actividad`
        });
        this.isSaving.set(false);
      }
    });
  }
  
  private resetForm(): void {
    this.title.set('');
    this.objective.set('');
    this.description.set('');
    this.link.set('');
    this.durationInMinutes.set(null);
    this.selectedColor.set('#E53935');
    this.selectedCognitiveProcesses.set([]);
    this.selectedTransversalCompetencies.set([]);
    this.selectedTeachingStrategies.set([]);
    this.selectedLearningResources.set([]);
    this.selectedLearningModality.set('');
    console.log('[AddActivity] Form reset');
  }
}

