import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { TagsBox } from '../course-info/components/tags-box/tags-box';
import { Course } from '@app/core/models';
import { EnumResponse } from '@app/core/services';

@Component({
  selector: 'app-expanded-info',
  imports: [DialogModule, InputTextModule, FloatLabel, FormsModule, TagsBox],
  templateUrl: './expanded-info.html',
  styleUrl: './expanded-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandedInfo {
  // Inputs y outputs
  visible = input<boolean>(false);
  courseData = input<Course | null>(null);
  onClose = output<void>();

  // Signals para los campos (read-only)
  carrera = computed(() => this.courseData()?.curricularUnit?.term?.name || 'No especificada');
  docente = computed(() => {
    const teachers = this.courseData()?.teachers;
    if (!teachers || teachers.length === 0) return 'No asignado';
    const teacher = teachers[0];
    const userData = teacher.user?.personalData;
    return userData ? `${userData.firstName} ${userData.lastName}` : 'No asignado';
  });
  unidadCurricular = computed(() => this.courseData()?.curricularUnit?.name || '');
  semestre = computed(() => this.courseData()?.curricularUnit?.term?.name || '');
  creditos = computed(() => this.courseData()?.curricularUnit?.credits?.toString() || '');

  // Tags para áreas de dominio y competencias profesionales
  domainAreasTags = signal<string[]>([]);
  professionalCompetenciesTags = signal<string[]>([]);

  // Opciones de enums (por ahora vacías, listas para conectar con servicio)
  domainAreasOptions = signal<EnumResponse[]>([]);
  professionalCompetenciesOptions = signal<EnumResponse[]>([]);

  constructor() {
    // Effect para actualizar tags cuando cambie courseData
    effect(() => {
      const course = this.courseData();
      if (course?.curricularUnit) {
        this.domainAreasTags.set(course.curricularUnit.domainAreas || []);
        this.professionalCompetenciesTags.set(course.curricularUnit.professionalCompetencies || []);
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
