import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { TagsBox } from '../tags-box/tags-box';
import { Course, CourseDetailedInfo } from '@app/core/models';
import { EnumResponse, EnumService, CourseService } from '@app/core/services';

@Component({
  selector: 'app-expanded-info',
  imports: [DialogModule, InputTextModule, FloatLabel, FormsModule, TagsBox],
  templateUrl: './expanded-info.html',
  styleUrl: './expanded-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandedInfo {
  private readonly courseService = inject(CourseService);
  private readonly enumService = inject(EnumService);
  
  // Inputs y outputs
  visible = input<boolean>(false);
  courseData = input<Course | null>(null);
  onClose = output<void>();

  // Signal for detailed information
  detailedInfo = signal<CourseDetailedInfo | null>(null);
  isLoading = signal<boolean>(false);

  // Signals for read-only fields based on detailed info
  carrera = computed(() => this.detailedInfo()?.programName || 'No especificada');

  docente = computed(() => {
    const teachers = this.detailedInfo()?.teachers;
    if (!teachers || teachers.length === 0) return 'No asignado';
    const teachersNames = teachers.map(t => `${t.name} ${t.lastName}`).join(', ');
    
    return teachersNames;
  });
  curricularUnit = computed(() => this.detailedInfo()?.curricularUnitName || '');
  semester = computed(() => this.detailedInfo()?.semesterNumber?.toString() || '');
  credits = computed(() => this.detailedInfo()?.credits?.toString() || '');

  // Shift options for enum mapping
  shiftOptions = signal<EnumResponse[]>([]);

  // Computed signals for administrative fields (from courseData, not detailedInfo)
  shift = computed(() => {
    const course = this.courseData();
    const shiftValue = course?.shift;
    if (!shiftValue) return 'No especificado';
    
    const shiftEnum = this.shiftOptions().find(opt => opt.value === shiftValue);
    return shiftEnum?.displayValue || shiftValue;
  });

  startDate = computed(() => {
    const course = this.courseData();
    if (!course?.startDate) return 'No especificada';
    return new Date(course.startDate).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  });

  endDate = computed(() => {
    const course = this.courseData();
    if (!course?.endDate) return 'No especificada';
    return new Date(course.endDate).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  });

  // Tags for domain areas and professional competencies
  domainAreasTags = signal<string[]>([]);
  professionalCompetenciesTags = signal<string[]>([]);

  // Enum options
  domainAreasOptions = signal<EnumResponse[]>([]);
  professionalCompetenciesOptions = signal<EnumResponse[]>([]);

  constructor() {
    this.loadEnumOptions();
    
    // Effect to load detailed info when dialog opens
    effect(() => {
      const isVisible = this.visible();
      const course = this.courseData();
      
      if (isVisible && course?.id) {
        this.loadDetailedInfo(course.id);
      }
    });
    
    // Effect to update tags when detailedInfo changes
    effect(() => {
      const info = this.detailedInfo();
      if (info) {
        this.domainAreasTags.set(info.domainAreas || []);
        this.professionalCompetenciesTags.set(info.professionalCompetencies || []);
      }
    });
  }

  private loadEnumOptions(): void {
    this.enumService.getShifts().subscribe({
      next: (data) => this.shiftOptions.set(data),
      error: (err) => console.error('[ExpandedInfo] Error loading shifts:', err)
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

  // Methods to handle tags (ready to connect with backend)
  removeDomainAreaTag(tag: string): void {
    console.log('[ExpandedInfo] Remove domain area tag:', tag);
    // TODO: Implement backend call
    const currentTags = this.domainAreasTags();
    this.domainAreasTags.set(currentTags.filter(t => t !== tag));
  }

  addDomainAreaTag(tag: string): void {
    console.log('[ExpandedInfo] Add domain area tag:', tag);
    // TODO: Implement backend call
    const currentTags = this.domainAreasTags();
    if (!currentTags.includes(tag)) {
      this.domainAreasTags.set([...currentTags, tag]);
    }
  }

  removeProfessionalCompetencyTag(tag: string): void {
    console.log('[ExpandedInfo] Remove professional competency tag:', tag);
    // TODO: Implement backend call
    const currentTags = this.professionalCompetenciesTags();
    this.professionalCompetenciesTags.set(currentTags.filter(t => t !== tag));
  }

  addProfessionalCompetencyTag(tag: string): void {
    console.log('[ExpandedInfo] Add professional competency tag:', tag);
    // TODO: Implement backend call
    const currentTags = this.professionalCompetenciesTags();
    if (!currentTags.includes(tag)) {
      this.professionalCompetenciesTags.set([...currentTags, tag]);
    }
  }
}
