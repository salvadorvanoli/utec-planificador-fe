import { Component } from '@angular/core';
import { WeeklyPlan } from './components/weekly-plan/weekly-plan';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { Titulo } from '@app/shared/components/titulo/titulo';
import { Header } from '../../layout/header/header';
import { CourseInfo } from './components/course-info/course-info';
@Component({
  selector: 'app-planner',
  imports: [WeeklyPlan, SectionHeader, Titulo, Header, CourseInfo],
  templateUrl: './planner.html',
  styleUrl: './planner.scss'
})
export class Planner {
  readonly InfoType = InfoType;
}
