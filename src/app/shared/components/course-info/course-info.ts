import { ChangeDetectionStrategy, Component, computed, input, effect, signal, inject, OnInit, output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { Selector } from '@app/shared/components/select/select';
import { ButtonComponent } from '@app/shared/components/button/button';
import { EnumService, EnumResponse, CourseService } from '@app/core/services';
import { TagsBox } from './components/tags-box/tags-box';
import { ExpandedInfo } from './components/expanded-info/expanded-info';
import { OfficeHours } from './components/office-hours/office-hours';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Course, CourseRequest } from '@app/core/models';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-course-info',
  imports: [FloatLabel, Selector, InputTextModule, FormsModule, Skeleton, TagsBox, Toast, ButtonComponent, ExpandedInfo, OfficeHours, DatePicker],
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
  isAdminMode = input<boolean>(false); // New: controls if admin fields are editable
  curricularUnitId = input<number | null>(null); // New: for course creation
  teacherIds = input<number[]>([]); // New: teacher IDs for course creation (supports multiple teachers)
  
  onCourseUpdated = output<Course>();
  onCourseCreated = output<Course>(); // New: emitted when a course is created

  // Editable fields for admin mode
  description = signal<string>('');
  shift = signal<string>('');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  partialGradingSystem = signal<string>('');
  
  virtualHours = signal<string>('');
  inPersonHours = signal<string>('');

  isRelatedToInvestigation = computed(() => 
    this.courseData()?.isRelatedToInvestigation || false
  );
  
  involvesActivitiesWithProductiveSector = computed(() => 
    this.courseData()?.involvesActivitiesWithProductiveSector || false
  );

  // Collections for creation mode
  selectedOds = signal<string[]>([]);
  selectedPrinciples = signal<string[]>([]);

  // Enum options signals
  shiftOptions = signal<EnumResponse[]>([]);
  scpOptions = signal<EnumResponse[]>([]);
  odsOptions = signal<EnumResponse[]>([]);
  principlesOptions = signal<EnumResponse[]>([]);

  // Opciones de Sí/No para los selects
  yesNoOptions = signal<EnumResponse[]>([
    { value: 'true', displayValue: 'Sí' },
    { value: 'false', displayValue: 'No' }
  ]);

  selectedInvestigation = computed(() => 
    this.courseData()?.isRelatedToInvestigation ? 'true' : 'false'
  );

  selectedProductiveSector = computed(() => 
    this.courseData()?.involvesActivitiesWithProductiveSector ? 'true' : 'false'
  );

  // Modales
  showExpandedInfoModal = signal(false);
  showOfficeHoursModal = signal(false);

  // Computed tags for display
  odsTags = computed(() => {
    const course = this.courseData();
    if (this.isCreationMode()) {
      return this.selectedOds()
        .map((value: string) => {
          const option = this.odsOptions().find(opt => opt.value === value);
          return option?.displayValue || value;
        });
    }
    
    if (!course || !course.sustainableDevelopmentGoals) return [];
    
    return course.sustainableDevelopmentGoals
      .map((value: string) => {
        const option = this.odsOptions().find(opt => opt.value === value);
        return option?.displayValue || value;
      });
  });

  principlesTags = computed(() => {
    const course = this.courseData();
    if (this.isCreationMode()) {
      return this.selectedPrinciples()
        .map((value: string) => {
          const option = this.principlesOptions().find(opt => opt.value === value);
          return option?.displayValue || value;
        });
    }
    
    if (!course || !course.universalDesignLearningPrinciples) return [];
    
    return course.universalDesignLearningPrinciples
      .map((value: string) => {
        const option = this.principlesOptions().find(opt => opt.value === value);
        return option?.displayValue || value;
      });
  });

  isCreationMode = computed(() => this.courseData() === null);

  ngOnInit(): void {
    this.loadEnumOptions();
  }

  private loadEnumOptions(): void {
    // Cargar shifts
    this.enumService.getShifts().subscribe({
      next: (data) => this.shiftOptions.set(data),
      error: (err) => console.error('Error loading shifts:', err)
    });

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
        
        // Update editable fields from course data
        this.description.set(data.description || '');
        this.shift.set(data.shift || '');
        this.startDate.set(data.startDate ? new Date(data.startDate) : null);
        this.endDate.set(data.endDate ? new Date(data.endDate) : null);
        this.partialGradingSystem.set(data.partialGradingSystem || '');
        this.isRelatedToInvestigation = signal(data.isRelatedToInvestigation || false);
        this.involvesActivitiesWithProductiveSector = signal(data.involvesActivitiesWithProductiveSector || false);
        
        const hoursMap = data.hoursPerDeliveryFormat;
        this.virtualHours.set(hoursMap?.['VIRTUAL']?.toString() || '');
        this.inPersonHours.set(hoursMap?.['IN_PERSON']?.toString() || '');
      }
    });
  }

  // Métodos para manejar tags
  removeOdsTag(tag: string): void {
    if (this.isCreationMode()) {
      // In creation mode, remove from local selection
      const option = this.odsOptions().find(opt => opt.displayValue === tag);
      if (option) {
        this.selectedOds.update(current => current.filter(v => v !== option.value));
      }
      return;
    }

    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    // Encontrar el value correspondiente al displayValue
    const option = this.odsOptions().find(opt => opt.displayValue === tag);
    if (!option) {
      console.error('Option not found for tag:', tag);
      return;
    }

    // Filtrar el ODS de la lista
    const updatedGoals = courseData.sustainableDevelopmentGoals.filter(g => g !== option.value);

    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.sustainableDevelopmentGoals = updatedGoals;

    // Llamar al servicio PUT para actualizar
    this.courseService.updateCourse(courseId, request).subscribe({
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
    if (this.isCreationMode()) {
      // In creation mode, remove from local selection
      const option = this.principlesOptions().find(opt => opt.displayValue === tag);
      if (option) {
        this.selectedPrinciples.update(current => current.filter(v => v !== option.value));
      }
      return;
    }

    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    // Encontrar el value correspondiente al displayValue
    const option = this.principlesOptions().find(opt => opt.displayValue === tag);
    if (!option) {
      console.error('Option not found for tag:', tag);
      return;
    }

    // Filtrar el principio de la lista
    const updatedPrinciples = courseData.universalDesignLearningPrinciples.filter(p => p !== option.value);

    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.universalDesignLearningPrinciples = updatedPrinciples;

    // Llamar al servicio PUT para actualizar
    this.courseService.updateCourse(courseId, request).subscribe({
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
    if (this.isCreationMode()) {
      // In creation mode, add to local selection
      if (!this.selectedOds().includes(value)) {
        this.selectedOds.update(current => [...current, value]);
      }
      return;
    }

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
    if (this.isCreationMode()) {
      // In creation mode, add to local selection
      if (!this.selectedPrinciples().includes(value)) {
        this.selectedPrinciples.update(current => [...current, value]);
      }
      return;
    }

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
    this.partialGradingSystem.set(value); // Actualizar signal primero
    
    if (this.isCreationMode()) return; // En modo creación, solo actualizar signal

    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    
    console.log('[onScpChange] courseId:', courseId);
    console.log('[onScpChange] courseData:', courseData);
    console.log('[onScpChange] curricularUnit:', courseData?.curricularUnit);
    
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.partialGradingSystem = value;

    console.log('[onScpChange] Request a enviar:', request);

    this.courseService.updateCourse(courseId, request).subscribe({      next: (updatedCourse) => {
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
        // Revertir cambio local en caso de error
        const currentValue = this.courseData()?.partialGradingSystem;
        if (currentValue) {
          this.partialGradingSystem.set(currentValue);
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el sistema de calificación parcial',
          life: 3000
        });
      }
    });
  }

  onHoursChange(): void {
    if (this.isCreationMode()) return;
    
    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    
    console.log('[onHoursChange] courseId:', courseId);
    console.log('[onHoursChange] courseData:', courseData);
    console.log('[onHoursChange] curricularUnit:', courseData?.curricularUnit);
    
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    const virtual = parseInt(this.virtualHours()) || 0;
    const inPerson = parseInt(this.inPersonHours()) || 0;

    const hoursPerDeliveryFormat: Record<string, number> = {
      VIRTUAL: virtual,
      IN_PERSON: inPerson
    };

    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.hoursPerDeliveryFormat = hoursPerDeliveryFormat;

    this.courseService.updateCourse(courseId, request).subscribe({      next: (updatedCourse) => {
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

  // Método para manejar cambio de investigación
  onInvestigationChange(value: string): void {
    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    
    console.log('[onInvestigationChange] courseId:', courseId);
    console.log('[onInvestigationChange] courseData:', courseData);
    console.log('[onInvestigationChange] curricularUnit:', courseData?.curricularUnit);
    
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    const isRelatedToInvestigation = value === 'true';
    
    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.isRelatedToInvestigation = isRelatedToInvestigation;

    this.courseService.updateCourse(courseId, request).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Vinculación a líneas de investigación: ${isRelatedToInvestigation ? 'Sí' : 'No'}`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error updating investigation status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la vinculación a líneas de investigación',
          life: 3000
        });
      }
    });
  }
  
  // Método para manejar cambio de actividades con sector productivo
  onProductiveSectorChange(value: string): void {
    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    
    console.log('[onProductiveSectorChange] courseId:', courseId);
    console.log('[onProductiveSectorChange] courseData:', courseData);
    console.log('[onProductiveSectorChange] curricularUnit:', courseData?.curricularUnit);
    
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    const involvesActivitiesWithProductiveSector = value === 'true';
    
    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.involvesActivitiesWithProductiveSector = involvesActivitiesWithProductiveSector;

    this.courseService.updateCourse(courseId, request).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Actividades vinculadas con el medio/sector productivo: ${involvesActivitiesWithProductiveSector ? 'Sí' : 'No'}`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error updating productive sector status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la vinculación con el sector productivo',
          life: 3000
        });
      }
    });
  }

  // Método para manejar cambio de descripción
  onDescriptionChange(): void {
    const courseId = this.courseData()?.id;
    const courseData = this.courseData();
    
    if (!courseId || !courseData) {
      console.error('No course data available');
      return;
    }

    const newDescription = this.description().trim();
    
    // Construir el request completo
    const request = this.buildCourseRequest(courseData);
    request.description = newDescription;

    this.courseService.updateCourse(courseId, request).subscribe({
      next: (updatedCourse) => {
        this.onCourseUpdated.emit(updatedCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'Descripción actualizada',
          detail: 'La descripción del curso se actualizó correctamente',
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error updating description:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la descripción',
          life: 3000
        });
      }
    });
  }

  onConsultClassesClick(): void {
    this.showOfficeHoursModal.set(true);
  }

  closeOfficeHoursModal(): void {
    this.showOfficeHoursModal.set(false);
  }

  onMoreInfoClick(): void {
    this.showExpandedInfoModal.set(true);
  }

  closeExpandedInfoModal(): void {
    this.showExpandedInfoModal.set(false);
  }

  // Método auxiliar para construir CourseRequest desde Course actual
  private buildCourseRequest(course: Course): CourseRequest {
    return {
      shift: course.shift,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      partialGradingSystem: course.partialGradingSystem,
      hoursPerDeliveryFormat: course.hoursPerDeliveryFormat,
      isRelatedToInvestigation: course.isRelatedToInvestigation,
      involvesActivitiesWithProductiveSector: course.involvesActivitiesWithProductiveSector,
      sustainableDevelopmentGoals: course.sustainableDevelopmentGoals,
      universalDesignLearningPrinciples: course.universalDesignLearningPrinciples,
      curricularUnitId: course.curricularUnit.id || (course as any).curricularUnitId,
      userIds: course.teachers?.map(t => t.id) || [],
    };
  }

  // Method to create a new course (admin mode only)
  createCourse(): void {
    if (!this.isCreationMode()) {
      console.error('createCourse called in edit mode');
      return;
    }

    const curricularUnitId = this.curricularUnitId();
    const teacherIds = this.teacherIds();

    if (!curricularUnitId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se especificó la unidad curricular',
        life: 3000
      });
      return;
    }

    if (!teacherIds || teacherIds.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar al menos un docente',
        life: 3000
      });
      return;
    }

    // Validate required date fields
    if (!this.startDate() || !this.endDate()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Las fechas de inicio y fin son obligatorias',
        life: 3000
      });
      return;
    }

    if (this.startDate()! > this.endDate()!) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fechas inválidas',
        detail: 'La fecha de inicio no puede ser posterior a la fecha de fin',
        life: 3000
      });
      return;
    }

    // Validate shift (now required)
    if (!this.shift()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'El turno es obligatorio',
        life: 3000
      });
      return;
    }

    // Build request with required fields
    const courseRequest: CourseRequest = {
      shift: this.shift()!,
      startDate: this.formatDateForBackend(this.startDate()!),
      endDate: this.formatDateForBackend(this.endDate()!),
      curricularUnitId: curricularUnitId,
      userIds: teacherIds
    };

    // Add optional fields only if they have values
    if (this.description()) {
      courseRequest.description = this.description();
    }

    if (this.partialGradingSystem()) {
      courseRequest.partialGradingSystem = this.partialGradingSystem();
    }

    const virtualHours = parseInt(this.virtualHours()) || 0;
    const inPersonHours = parseInt(this.inPersonHours()) || 0;
    if (virtualHours > 0 || inPersonHours > 0) {
      courseRequest.hoursPerDeliveryFormat = {
        VIRTUAL: virtualHours,
        IN_PERSON: inPersonHours
      };
    }

    if (this.isRelatedToInvestigation()) {
      courseRequest.isRelatedToInvestigation = this.isRelatedToInvestigation();
    }

    if (this.involvesActivitiesWithProductiveSector()) {
      courseRequest.involvesActivitiesWithProductiveSector = this.involvesActivitiesWithProductiveSector();
    }

    if (this.selectedOds().length > 0) {
      courseRequest.sustainableDevelopmentGoals = this.selectedOds();
    }

    if (this.selectedPrinciples().length > 0) {
      courseRequest.universalDesignLearningPrinciples = this.selectedPrinciples();
    }

    this.courseService.createCourse(courseRequest).subscribe({
      next: (createdCourse) => {
        this.onCourseCreated.emit(createdCourse);
        this.messageService.add({
          severity: 'success',
          summary: 'Curso creado',
          detail: 'El curso se creó correctamente',
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error creating course:', err);
        const errorMessage = err.error?.message || 'No se pudo crear el curso';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 3000
        });
      }
    });
  }

  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Autocompletes form fields from a previous course
   * Used when admin selects curricular unit and teacher
   */
  autocompleteFromCourse(course: Course): void {
    console.log('Autocompleting from course:', course);
    
    // Set admin fields with values from previous course
    if (course.shift) {
      this.shift.set(course.shift);
    }
    
    if (course.description) {
      this.description.set(course.description);
    }
    
    if (course.partialGradingSystem) {
      this.partialGradingSystem.set(course.partialGradingSystem);
    }
    
    // Set hours
    if (course.hoursPerDeliveryFormat) {
      const virtualHours = course.hoursPerDeliveryFormat['VIRTUAL'] || 0;
      const inPersonHours = course.hoursPerDeliveryFormat['IN_PERSON'] || 0;
      this.virtualHours.set(virtualHours.toString());
      this.inPersonHours.set(inPersonHours.toString());
    }
    
    // Set boolean fields
    if (course.isRelatedToInvestigation !== undefined) {
      this.isRelatedToInvestigation = signal(course.isRelatedToInvestigation);
    }
    
    if (course.involvesActivitiesWithProductiveSector !== undefined) {
      this.involvesActivitiesWithProductiveSector = signal(course.involvesActivitiesWithProductiveSector);
    }
    
    // Set ODS
    if (course.sustainableDevelopmentGoals && course.sustainableDevelopmentGoals.length > 0) {
      this.selectedOds.set([...course.sustainableDevelopmentGoals]);
    }
    
    // Set UDL principles
    if (course.universalDesignLearningPrinciples && course.universalDesignLearningPrinciples.length > 0) {
      this.selectedPrinciples.set([...course.universalDesignLearningPrinciples]);
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'Campos autocompletados',
      detail: 'Se han llenado los campos con los datos del último curso similar',
      life: 3000
    });
  }
}
