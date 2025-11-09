import { ChangeDetectionStrategy, effect, Component, signal, input, inject, OnInit } from '@angular/core';
import { ColorBlock } from '@app/shared/components/color-block/color-block';
import { Selector, EnumOption } from '@app/shared/components/select/select'
import { PositionService, RegionalTechnologicalInstituteService, UserService } from '@app/core/services';
import { PeriodResponse, RegionalTechnologicalInstitute, UserBasicResponse } from '@app/core/models';

@Component({
  selector: 'app-filter-panel',
  imports: [ColorBlock, Selector],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterPanel implements OnInit {
  private readonly positionService = inject(PositionService);
  private readonly rtiService = inject(RegionalTechnologicalInstituteService);
  private readonly userService = inject(UserService);

  readonly docente = input<boolean>(false);
  readonly docenteState = signal<boolean>(false);

  readonly periods = signal<PeriodResponse[]>([]);
  readonly periodsOptions = signal<EnumOption[]>([]);
  readonly selectedPeriod = signal<string | null>(null);
  readonly isLoadingPeriods = signal<boolean>(false);

  readonly rtis = signal<RegionalTechnologicalInstitute[]>([]);
  readonly rtiOptions = signal<EnumOption[]>([]);
  readonly selectedRtiId = signal<number | null>(null);
  readonly isLoadingRtis = signal<boolean>(false);

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
      const rtiId = this.selectedRtiId();
      if (!this.docente() && rtiId !== null) {
        this.loadTeachers(rtiId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const context = this.positionService.selectedContext();
    if (context?.campus && this.docente()) {
      this.loadPeriods(context.campus.id);
    }

    if (!this.docente()) {
      this.loadRtis();
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

  private loadRtis(teacherId?: number): void {
    this.isLoadingRtis.set(true);
    
    this.rtiService.getRegionalTechnologicalInstitutes(teacherId).subscribe({
      next: (rtis) => {
        this.rtis.set(rtis);
        this.rtiOptions.set(
          rtis.map(rti => ({
            value: rti.id.toString(),
            displayValue: rti.name
          }))
        );
        this.isLoadingRtis.set(false);
      },
      error: (error) => {
        console.error('Error loading RTIs:', error);
        this.rtis.set([]);
        this.rtiOptions.set([]);
        this.isLoadingRtis.set(false);
      }
    });
  }

  private loadTeachers(rtiId?: number): void {
    this.isLoadingTeachers.set(true);
    
    this.userService.getTeachers(rtiId).subscribe({
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

  onRtiChange(rtiId: string): void {
    const id = parseInt(rtiId, 10);
    this.selectedRtiId.set(id);
    console.log('RTI selected:', id);
    
    this.loadTeachers(id);
  }

  onTeacherChange(teacherId: string): void {
    const id = parseInt(teacherId, 10);
    this.selectedTeacherId.set(id);
    console.log('Teacher selected:', id);
    
    this.loadRtis(id);
  }
}
