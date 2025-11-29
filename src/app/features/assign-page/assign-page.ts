import { Component, inject, OnInit, signal, computed, ViewChild, effect } from '@angular/core';
import { SectionHeader } from '@app/layout/section-header/section-header';
import { Selector, EnumOption } from '@app/shared/components/select/select';
import { MultiSelector } from '@app/shared/components/multiselect/multiselect';
import { ButtonComponent } from '@app/shared/components/button/button';
import { InfoType } from '@app/core/enums/info';
import { CourseInfo } from '@app/shared/components/course-info/course-info';
import { PositionService, CurricularUnitService, UserService, CourseService } from '@app/core/services';
import { CurricularUnitResponse, UserBasicResponse, Course } from '@app/core/models';
import { Router, ActivatedRoute } from '@angular/router';
import { buildContextQueryParams, extractContextFromUrl } from '@app/shared/utils/context-encoder';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-assign-page',
  imports: [SectionHeader, Selector, MultiSelector, ButtonComponent, CourseInfo],
  templateUrl: './assign-page.html',
  styleUrl: './assign-page.scss'
})
export class AssignPage implements OnInit {
  readonly InfoType = InfoType;
  
  @ViewChild(CourseInfo) courseInfoComponent!: CourseInfo;
  
  private readonly positionService = inject(PositionService);
  private readonly curricularUnitService = inject(CurricularUnitService);
  private readonly userService = inject(UserService);
  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal<boolean>(false);
  readonly courseId = signal<number | null>(null);
  readonly courseData = signal<Course | null>(null);
  readonly isLoadingCourse = signal<boolean>(false);
  
  readonly curricularUnits = signal<CurricularUnitResponse[]>([]);
  readonly teachers = signal<UserBasicResponse[]>([]);
  readonly selectedCurricularUnit = signal<string>('');
  readonly selectedTeachers = signal<string[]>([]);
  readonly isLoadingCurricularUnits = signal<boolean>(true);
  readonly isLoadingTeachers = signal<boolean>(true);
  readonly latestCourse = signal<Course | null>(null);
  
  readonly pageTitle = computed(() => 
    this.isEditMode() ? 'Editar curso' : 'Crear curso'
  );
  
  readonly buttonLabel = computed(() => 
    this.isEditMode() ? 'Guardar cambios' : 'Crear curso'
  );

  readonly curricularUnitOptions = computed<EnumOption[]>(() => 
    this.curricularUnits().map(cu => ({
      value: cu.id.toString(),
      displayValue: cu.term?.program?.name ? `${cu.name} - ${cu.term.program.name}` : cu.name
    }))
  );

  readonly teacherOptions = computed<EnumOption[]>(() => 
    this.teachers().map(teacher => ({
      value: teacher.id.toString(),
      displayValue: teacher.fullName
    }))
  );

  readonly selectedTeacherIds = computed<number[]>(() => 
    this.selectedTeachers().map(id => +id)
  );

  readonly isFormValid = computed<boolean>(() => 
    !!this.selectedCurricularUnit() && this.selectedTeachers().length > 0
  );

  constructor() {
    // Effect para autocompletar campos cuando se selecciona unidad curricular y al menos un docente (solo en modo creación)
    effect(() => {
      // Skip autocomplete in edit mode
      if (this.isEditMode()) return;
      
      const curricularUnitId = this.selectedCurricularUnit();
      const teacherIds = this.selectedTeachers();
      
      // Solo buscar si hay unidad curricular y al menos un docente seleccionado
      if (curricularUnitId && teacherIds.length > 0) {
        // Usar el primer docente seleccionado para buscar el último curso
        const primaryTeacherId = +teacherIds[0];
        
        this.courseService.getLatestCourse(+curricularUnitId, primaryTeacherId).subscribe({
          next: (course) => {
            if (course) {
              console.log('Found previous course for autocomplete:', course);
              this.latestCourse.set(course);
              
              // Notificar al componente course-info para que autocomplete
              if (this.courseInfoComponent) {
                this.courseInfoComponent.autocompleteFromCourse(course);
              }
            } else {
              console.log('No previous course found');
              this.latestCourse.set(null);
            }
          },
          error: (error) => {
            console.error('Error loading latest course:', error);
            this.latestCourse.set(null);
          }
        });
      } else {
        this.latestCourse.set(null);
      }
    });
  }

  ngOnInit(): void {
    // Check encrypted context to determine if we're editing or creating
    this.route.queryParams.subscribe(params => {
      const context = extractContextFromUrl(params);
      const isEdit = context?.isEdit === true;
      const courseId = context?.courseId ?? null;
      
      this.isEditMode.set(isEdit);
      this.courseId.set(courseId);
      
      if (isEdit && courseId) {
        this.loadCourseForEdit(courseId);
      } else {
        this.loadData();
      }
    });
  }

  private loadData(): void {
    const context = this.positionService.selectedContext();
    
    if (!context) {
      console.warn('No context selected');
      this.isLoadingCurricularUnits.set(false);
      this.isLoadingTeachers.set(false);
      return;
    }

    const campusId = context.campus.id;

    // Cargar unidades curriculares del campus
    this.curricularUnitService.getCurricularUnits(campusId).subscribe({
      next: (units) => {
        this.curricularUnits.set(units);
        this.isLoadingCurricularUnits.set(false);
      },
      error: (error) => {
        console.error('Error loading curricular units:', error);
        this.isLoadingCurricularUnits.set(false);
      }
    });

    // Cargar docentes del campus
    this.userService.getTeachers(campusId).subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.isLoadingTeachers.set(false);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.isLoadingTeachers.set(false);
      }
    });
  }

  onCurricularUnitChange(curricularUnitId: string): void {
    this.selectedCurricularUnit.set(curricularUnitId);
    console.log('Curricular unit selected:', curricularUnitId);
  }

  onTeachersChange(teacherIds: string[]): void {
    this.selectedTeachers.set(teacherIds);
    console.log('Teachers selected:', teacherIds);
  }

  private loadCourseForEdit(courseId: number): void {
    this.isLoadingCourse.set(true);
    
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        console.log('Course loaded for editing:', course);
        this.courseData.set(course);
        
        // Pre-select curricular unit and teachers
        const curricularUnitIdStr = course.curricularUnit.id.toString();
        const teacherIdsStr = course.teachers.map(t => t.id.toString());
        
        this.selectedCurricularUnit.set(curricularUnitIdStr);
        this.selectedTeachers.set(teacherIdsStr);
        
        this.isLoadingCourse.set(false);
        
        // Load data after setting the course
        this.loadData();
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoadingCourse.set(false);
        // Redirect back to catalog on error
        const context = this.positionService.selectedContext();
        if (context) {
          const queryParams = buildContextQueryParams({
            itrId: context.itr.id,
            campusId: context.campus.id,
            mode: 'management'
          });
          this.router.navigate(['/course-catalog'], { queryParams });
        }
      }
    });
  }

  onCreateOrUpdateCourse(): void {
    if (this.courseInfoComponent) {
      if (this.isEditMode()) {
        this.courseInfoComponent.updateCourse();
      } else {
        this.courseInfoComponent.createCourse();
      }
    }
  }

  onCourseCreated(course: Course): void {
    console.log('Course created successfully:', course);
    
    // Redirect back to course catalog in management mode
    const context = this.positionService.selectedContext();
    if (context) {
      const queryParams = buildContextQueryParams({
        itrId: context.itr.id,
        campusId: context.campus.id,
        mode: 'management'
      });
      this.router.navigate(['/course-catalog'], { queryParams });
    }
  }

  onCourseUpdated(course: Course): void {
    console.log('Course updated successfully:', course);
    
    // Redirect back to course catalog in management mode
    const context = this.positionService.selectedContext();
    if (context) {
      const queryParams = buildContextQueryParams({
        itrId: context.itr.id,
        campusId: context.campus.id,
        mode: 'management'
      });
      this.router.navigate(['/course-catalog'], { queryParams });
    }
  }
}

