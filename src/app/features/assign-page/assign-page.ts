import { Component, inject, OnInit, signal, computed, ViewChild, effect } from '@angular/core';
import { SectionHeader } from '@app/layout/section-header/section-header';
import { Selector, EnumOption } from '@app/shared/components/select/select';
import { MultiSelector } from '@app/shared/components/multiselect/multiselect';
import { ButtonComponent } from '@app/shared/components/button/button';
import { InfoType } from '@app/core/enums/info';
import { CourseInfo } from '@app/shared/components/course-info/course-info';
import { PositionService, CurricularUnitService, UserService, CourseService } from '@app/core/services';
import { CurricularUnitResponse, UserBasicResponse, Course } from '@app/core/models';
import { Router } from '@angular/router';

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

  readonly curricularUnits = signal<CurricularUnitResponse[]>([]);
  readonly teachers = signal<UserBasicResponse[]>([]);
  readonly selectedCurricularUnit = signal<string>('');
  readonly selectedTeachers = signal<string[]>([]);
  readonly isLoadingCurricularUnits = signal<boolean>(true);
  readonly isLoadingTeachers = signal<boolean>(true);
  readonly latestCourse = signal<Course | null>(null);

  readonly curricularUnitOptions = computed<EnumOption[]>(() => 
    this.curricularUnits().map(cu => ({
      value: cu.id.toString(),
      displayValue: cu.name
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
    // Effect para autocompletar campos cuando se selecciona unidad curricular y al menos un docente
    effect(() => {
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
    this.loadData();
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

  onCreateCourse(): void {
    if (this.courseInfoComponent) {
      this.courseInfoComponent.createCourse();
    }
  }

  onCourseCreated(course: Course): void {
    console.log('Course created successfully:', course);
    // Redirect to planner with the new course
    this.router.navigate(['/planner', course.id]);
  }
}

