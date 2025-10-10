import { Component } from '@angular/core';
import { CourseCard } from '../../../../shared/components/course-card/course-card';
import { Searchbar } from '../../../../shared/components/searchbar/searchbar';
import { Paginator } from '../../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-content-panel',
  imports: [CourseCard, Searchbar, Paginator],
  templateUrl: './content-panel.html',
  styleUrl: './content-panel.scss'
})
export class ContentPanel {

}
