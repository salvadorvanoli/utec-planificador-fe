import { Component } from '@angular/core';
import { CourseCard } from '@app/shared/components/course-card/course-card';

@Component({
  selector: 'app-course-list',
  imports: [CourseCard],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss'
})
export class CourseList {

}
