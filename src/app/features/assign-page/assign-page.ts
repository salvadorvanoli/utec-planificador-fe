import { Component } from '@angular/core';
import { SectionHeader } from '@app/layout/section-header/section-header';
import { Selector } from '@app/shared/components/select/select';
import { ButtonComponent } from '@app/shared/components/button/button';
import { InfoType } from '@app/core/enums/info';
import { CourseList } from './components/course-list/course-list';
import { Titulo } from '@app/shared/components/titulo/titulo';

@Component({
  selector: 'app-assign-page',
  imports: [SectionHeader, Selector, ButtonComponent, CourseList, Titulo],
  templateUrl: './assign-page.html',
  styleUrl: './assign-page.scss'
})
export class AssignPage {
    readonly InfoType = InfoType;
}
