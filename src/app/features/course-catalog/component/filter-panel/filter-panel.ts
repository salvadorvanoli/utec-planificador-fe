import { ChangeDetectionStrategy, effect, Component, signal, input, inject, OnInit } from '@angular/core';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { Selector, EnumOption } from '@app/shared/components/select/select'
import { PositionService, CampusService, UserService } from '@app/core/services';
import { PeriodResponse, Campus, UserBasicResponse } from '@app/core/models';

@Component({
  selector: 'app-filter-panel',
  imports: [ColorBlock, Selector],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterPanel implements OnInit {
  private readonly positionService = inject(PositionService);
  private readonly campusService = inject(CampusService);
  private readonly userService = inject(UserService);

  readonly docente = input<boolean>(false);
  readonly docenteState = signal<boolean>(false);

  readonly periods = signal<PeriodResponse[]>([]);
  readonly periodsOptions = signal<EnumOption[]>([]);
  readonly selectedPeriod = signal<string | null>(null);
  readonly isLoadingPeriods = signal<boolean>(false);

  readonly campuses = signal<Campus[]>([]);
  readonly campusOptions = signal<EnumOption[]>([]);
  readonly selectedCampusId = signal<number | null>(null);
  readonly isLoadingCampuses = signal<boolean>(false);

  readonly teachers = signal<UserBasicResponse[]>([]);
  readonly teacherOptions = signal<EnumOption[]>([]);
  readonly selectedTeacherId = signal<number | null>(null);
  readonly isLoadingTeachers = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.docenteState.set(this.docente());
    });

    effect(() => {
      const context = this.positionService.selectedContext();
      if (context?.campus && this.docente()) {
        this.loadPeriods(context.campus.id);
      } else {
        this.periods.set([]);
        this.periodsOptions.set([]);
      }
    });

    effect(() => {
      const campusId = this.selectedCampusId();
      if (!this.docente() && campusId !== null) {
        this.loadTeachers(campusId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const context = this.positionService.selectedContext();
    if (context?.campus && this.docente()) {
      this.loadPeriods(context.campus.id);
    }

    if (!this.docente()) {
      this.loadCampuses();
      this.loadTeachers();
    }
  }

  private loadPeriods(campusId: number): void {
    this.isLoadingPeriods.set(true);
    
    this.positionService.getUserPeriodsByCampus(campusId).subscribe({
      next: (periods) => {
        this.periods.set(periods);
        this.periodsOptions.set(
          periods.map(p => ({
            value: p.period,
            displayValue: p.period
          }))
        );
        this.isLoadingPeriods.set(false);
      },
      error: (error) => {
        console.error('Error loading periods:', error);
        this.periods.set([]);
        this.periodsOptions.set([]);
        this.isLoadingPeriods.set(false);
      }
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod.set(period);
    console.log('Period selected:', period);
  }

  private loadCampuses(teacherId?: number): void {
    this.isLoadingCampuses.set(true);
    
    this.campusService.getCampuses(teacherId).subscribe({
      next: (campuses) => {
        this.campuses.set(campuses);
        this.campusOptions.set(
          campuses.map(campus => ({
            value: campus.id.toString(),
            displayValue: campus.name
          }))
        );
        this.isLoadingCampuses.set(false);
      },
      error: (error) => {
        console.error('Error loading campuses:', error);
        this.campuses.set([]);
        this.campusOptions.set([]);
        this.isLoadingCampuses.set(false);
      }
    });
  }

  private loadTeachers(campusId?: number): void {
    this.isLoadingTeachers.set(true);
    
    this.userService.getTeachers(campusId).subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.teacherOptions.set(
          teachers.map(teacher => ({
            value: teacher.id.toString(),
            displayValue: teacher.fullName || teacher.email
          }))
        );
        this.isLoadingTeachers.set(false);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.teachers.set([]);
        this.teacherOptions.set([]);
        this.isLoadingTeachers.set(false);
      }
    });
  }

  onCampusChange(campusId: string): void {
    const id = parseInt(campusId, 10);
    this.selectedCampusId.set(id);
    console.log('Campus selected:', id);
    
    this.loadTeachers(id);
  }

  onTeacherChange(teacherId: string): void {
    const id = parseInt(teacherId, 10);
    this.selectedTeacherId.set(id);
    console.log('Teacher selected:', id);
    
    this.loadCampuses(id);
  }
}
