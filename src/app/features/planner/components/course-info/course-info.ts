import { ChangeDetectionStrategy, Component, computed, input, effect, signal, inject, OnInit, output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { Selector } from '@app/shared/components/select/select';
import { EnumService, EnumResponse, CourseService } from '@app/core/services';
import { TagsBox } from './components/tags-box/tags-box';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Course } from '@app/core/models';

@Component({
  selector: 'app-course-info',
  imports: [FloatLabel, Selector, InputTextModule, FormsModule, Skeleton, TagsBox, Toast],
  providers: [MessageService],
  templateUrl: './course-info.html',
  styleUrl: './course-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseInfo implements OnInit {
  private readonly enumService = inject(EnumService);
  private readonly courseService = inject(CourseService);
  private readonly messageService = inject(MessageService);
  
  // Inputs
  courseData = input<Course | null>(null);
  isLoading = input<boolean>(true);
  
  onCourseUpdated = output<Course>();

  description = computed(() => this.courseData()?.description || '');
  shift = computed(() => this.courseData()?.shift || '');
  startDate = computed(() => this.courseData()?.startDate || '');
  endDate = computed(() => this.courseData()?.endDate || '');
  partialGradingSystem = computed(() => this.courseData()?.partialGradingSystem || '');
  
  virtualHours = signal<string>('');
  inPersonHours = signal<string>('');

  isRelatedToInvestigation = computed(() => 
    this.courseData()?.isRelatedToInvestigation || false
  );
  
  involvesActivitiesWithProductiveSector = computed(() => 
    this.courseData()?.involvesActivitiesWithProductiveSector || false
  );

  // Enum options signals
  scpOptions = signal<EnumResponse[]>([]);
  odsOptions = signal<EnumResponse[]>([]);
  principlesOptions = signal<EnumResponse[]>([]);

  odsTags = computed(() => {
    const course = this.courseData();
    if (!course || !course.sustainableDevelopmentGoals) return [];
    
    return course.sustainableDevelopmentGoals
      .map((value: string) => {
        const option = this.odsOptions().find(opt => opt.value === value);
        return option?.displayValue || value;
      });
  });

  principlesTags = computed(() => {
    const course = this.courseData();
    if (!course || !course.universalDesignLearningPrinciples) return [];
    
    return course.universalDesignLearningPrinciples
      .map((value: string) => {
        const option = this.principlesOptions().find(opt => opt.value === value);
        return option?.displayValue || value;
      });
  });

  ngOnInit(): void {
    this.loadEnumOptions();
  }

  private loadEnumOptions(): void {
    this.enumService.getPartialGradingSystems().subscribe({
      next: (data) => this.scpOptions.set(data),
      error: (err) => console.error('Error loading partial grading systems:', err)
    });

    // Cargar ODS
    this.enumService.getSustainableDevelopmentGoals().subscribe({
      next: (data) => this.odsOptions.set(data),
      error: (err) => console.error('Error loading SDGs:', err)
    });

    // Cargar Principios del Diseño Universal del Aprendizaje
    this.enumService.getUniversalDesignLearningPrinciples().subscribe({
      next: (data) => this.principlesOptions.set(data),
      error: (err) => console.error('Error loading UDL principles:', err)
    });
  }

  constructor() {
    effect(() => {
      const data = this.courseData();
      if (data) {
        console.log('Course data loaded:', data);
        const hoursMap = data.hoursPerDeliveryFormat;
        this.virtualHours.set(hoursMap?.['VIRTUAL']?.toString() || '');
        this.inPersonHours.set(hoursMap?.['IN_PERSON']?.toString() || '');
      }
    });
  }

  // Métodos para manejar tags
  removeOdsTag(tag: string): void {
    const courseId = this.courseData()?.id;
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    // Encontrar el value correspondiente al displayValue
    const option = this.odsOptions().find(opt => opt.displayValue === tag);
    if (!option) {
      console.error('Option not found for tag:', tag);
      return;
    }

    // Llamar al servicio para eliminar del backend
    this.courseService.deleteSustainableDevelopmentGoal(courseId, option.value).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'ODS eliminado',
          detail: `${tag} se eliminó correctamente`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error removing SDG:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el ODS',
          life: 3000
        });
      }
    });
  }

  removePrincipleTag(tag: string): void {
    const courseId = this.courseData()?.id;
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    // Encontrar el value correspondiente al displayValue
    const option = this.principlesOptions().find(opt => opt.displayValue === tag);
    if (!option) {
      console.error('Option not found for tag:', tag);
      return;
    }

    // Llamar al servicio para eliminar del backend
    this.courseService.deleteUniversalDesignLearningPrinciple(courseId, option.value).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'Principio eliminado',
          detail: `${tag} se eliminó correctamente`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error removing UDL principle:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el principio',
          life: 3000
        });
      }
    });
  }

  addOdsTag(value: string): void {
    const courseId = this.courseData()?.id;
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    // Verificar si ya existe
    const currentOds = this.courseData()?.sustainableDevelopmentGoals || [];
    if (currentOds.includes(value)) {
      const option = this.odsOptions().find(opt => opt.value === value);
      this.messageService.add({
        severity: 'warn',
        summary: 'ODS ya existe',
        detail: `${option?.displayValue || value} ya está agregado al curso`,
        life: 3000
      });
      return;
    }

    // Llamar al servicio para agregar al backend
    this.courseService.addSustainableDevelopmentGoal(courseId, value).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        const option = this.odsOptions().find(opt => opt.value === value);
        this.messageService.add({
          severity: 'success',
          summary: 'ODS agregado',
          detail: `${option?.displayValue || value} se agregó correctamente`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error adding SDG:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar el ODS',
          life: 3000
        });
      }
    });
  }

  addPrincipleTag(value: string): void {
    const courseId = this.courseData()?.id;
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    // Verificar si ya existe
    const currentPrinciples = this.courseData()?.universalDesignLearningPrinciples || [];
    if (currentPrinciples.includes(value)) {
      const option = this.principlesOptions().find(opt => opt.value === value);
      this.messageService.add({
        severity: 'warn',
        summary: 'Principio ya existe',
        detail: `${option?.displayValue || value} ya está agregado al curso`,
        life: 3000
      });
      return;
    }

    // Llamar al servicio para agregar al backend
    this.courseService.addUniversalDesignLearningPrinciple(courseId, value).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        const option = this.principlesOptions().find(opt => opt.value === value);
        this.messageService.add({
          severity: 'success',
          summary: 'Principio agregado',
          detail: `${option?.displayValue || value} se agregó correctamente`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error adding UDL principle:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar el principio',
          life: 3000
        });
      }
    });
  }

  // Método para manejar cambio de SCP
  onScpChange(value: string): void {
    const courseId = this.courseData()?.id;
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    this.courseService.updatePartialGradingSystem(courseId, value).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        const option = this.scpOptions().find(opt => opt.value === value);
        this.messageService.add({
          severity: 'success',
          summary: 'SCP actualizado',
          detail: `Sistema de calificación parcial cambiado a ${option?.displayValue || value}`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error updating partial grading system:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el sistema de calificación parcial',
          life: 3000
        });
      }
    });
  }

  // Método para manejar cambio de horas
  onHoursChange(): void {
    const courseId = this.courseData()?.id;
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    const virtual = parseInt(this.virtualHours()) || 0;
    const inPerson = parseInt(this.inPersonHours()) || 0;

    const hoursPerDeliveryFormat: Record<string, number> = {
      VIRTUAL: virtual,
      IN_PERSON: inPerson
    };

    this.courseService.updateHoursPerDeliveryFormat(courseId, hoursPerDeliveryFormat).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'Horas actualizadas',
          detail: `Horas virtuales: ${virtual}, Horas presenciales: ${inPerson}`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error updating hours:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar las horas',
          life: 3000
        });
      }
    });
  }
}
