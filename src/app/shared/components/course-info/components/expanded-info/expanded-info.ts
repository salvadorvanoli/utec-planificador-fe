import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { TagsBox } from '../tags-box/tags-box';
import { Course, CourseDetailedInfo } from '@app/core/models';
import { EnumResponse, CourseService } from '@app/core/services';

@Component({
  selector: 'app-expanded-info',
  imports: [DialogModule, InputTextModule, FloatLabel, FormsModule, TagsBox],
  templateUrl: './expanded-info.html',
  styleUrl: './expanded-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandedInfo {
  private readonly courseService = inject(CourseService);
  
  // Inputs y outputs
  visible = input<boolean>(false);
  courseData = input<Course | null>(null);
  onClose = output<void>();

  // Signal para la información detallada
  detailedInfo = signal<CourseDetailedInfo | null>(null);
  isLoading = signal<boolean>(false);

  // Signals para los campos (read-only) basados en detailed info
  carrera = computed(() => this.detailedInfo()?.programName || 'No especificada');

  docente = computed(() => {
    const teachers = this.detailedInfo()?.teachers;
    if (!teachers || teachers.length === 0) return 'No asignado';
    const teachersNames = teachers.map(t => `${t.name} ${t.lastName}`).join(', ');
    
    return teachersNames;
  });
  unidadCurricular = computed(() => this.detailedInfo()?.curricularUnitName || '');
  semestre = computed(() => this.detailedInfo()?.semesterNumber?.toString() || '');
  creditos = computed(() => this.detailedInfo()?.credits?.toString() || '');

  // Tags para áreas de dominio y competencias profesionales
  domainAreasTags = signal<string[]>([]);
  professionalCompetenciesTags = signal<string[]>([]);

  // Opciones de enums (por ahora vacías, listas para conectar con servicio)
  domainAreasOptions = signal<EnumResponse[]>([]);
  professionalCompetenciesOptions = signal<EnumResponse[]>([]);

  constructor() {
    // Effect para cargar información detallada cuando se abre el diálogo
    effect(() => {
      const isVisible = this.visible();
      const course = this.courseData();
      
      if (isVisible && course?.id) {
        this.loadDetailedInfo(course.id);
      }
    });
    
    // Effect para actualizar tags cuando cambie detailedInfo
    effect(() => {
      const info = this.detailedInfo();
      if (info) {
        this.domainAreasTags.set(info.domainAreas || []);
        this.professionalCompetenciesTags.set(info.professionalCompetencies || []);
      }
    });
  }

  loadDetailedInfo(courseId: number): void {
    console.log('[ExpandedInfo] Loading detailed info for course:', courseId);
    this.isLoading.set(true);
    
    this.courseService.getDetailedInfo(courseId).subscribe({
      next: (info) => {
        console.log('[ExpandedInfo] Detailed info loaded:', info);
        this.detailedInfo.set(info);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[ExpandedInfo] Error loading detailed info:', error);
        this.isLoading.set(false);
      }
    });
  }

  closeDialog(): void {
    this.onClose.emit();
  }

  // Métodos para manejar tags (preparados para conectar con backend)
  removeDomainAreaTag(tag: string): void {
    console.log('[ExpandedInfo] Remove domain area tag:', tag);
    // TODO: Implementar llamada al backend
    const currentTags = this.domainAreasTags();
    this.domainAreasTags.set(currentTags.filter(t => t !== tag));
  }

  addDomainAreaTag(tag: string): void {
    console.log('[ExpandedInfo] Add domain area tag:', tag);
    // TODO: Implementar llamada al backend
    const currentTags = this.domainAreasTags();
    if (!currentTags.includes(tag)) {
      this.domainAreasTags.set([...currentTags, tag]);
    }
  }

  removeProfessionalCompetencyTag(tag: string): void {
    console.log('[ExpandedInfo] Remove professional competency tag:', tag);
    // TODO: Implementar llamada al backend
    const currentTags = this.professionalCompetenciesTags();
    this.professionalCompetenciesTags.set(currentTags.filter(t => t !== tag));
  }

  addProfessionalCompetencyTag(tag: string): void {
    console.log('[ExpandedInfo] Add professional competency tag:', tag);
    // TODO: Implementar llamada al backend
    const currentTags = this.professionalCompetenciesTags();
    if (!currentTags.includes(tag)) {
      this.professionalCompetenciesTags.set([...currentTags, tag]);
    }
  }
}
