import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeeklyPlan } from './components/weekly-plan/weekly-plan';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { Titulo } from '@app/shared/components/titulo/titulo';
import { CourseInfo } from '@app/shared/components/course-info/course-info';
import { CourseService } from '@app/core/services';
import { Course } from '@app/core/models';

@Component({
  selector: 'app-planner',
  imports: [WeeklyPlan, SectionHeader, Titulo, CourseInfo],
  templateUrl: './planner.html',
  styleUrl: './planner.scss'
})
export class Planner implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  
  readonly InfoType = InfoType;
  
  courseData = signal<Course | null>(null);
  isLoadingCourse = signal(true);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    
    if (courseId) {
      this.loadCourseData(+courseId);
    }
  }

  private loadCourseData(courseId: number): void {
    this.isLoadingCourse.set(true);
    
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.courseData.set(course);
        this.isLoadingCourse.set(false);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoadingCourse.set(false);
      }
    });
  }

  handleCourseUpdate(updatedCourse: Course): void {
    this.courseData.set(updatedCourse);
  }
}
