import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { DataPanel } from '@app/features/statistics-page/components/data-panel/data-panel';
import { ReportPanel } from '@app/features/statistics-page/components/report-panel/report-panel';
import { CourseService } from '@app/core/services';
import { Course } from '@app/core/models';

@Component({
  selector: 'app-statistics-page',
  imports: [SectionHeader, DataPanel, ReportPanel],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.scss'
})
export class StatisticsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  
  readonly InfoType = InfoType;
  
  courseData = signal<Course | null>(null);
  isLoadingCourse = signal(true);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    
    if (courseId) {
      this.loadCourseData(+courseId);
    } else {
      console.warn('[StatisticsPage] No courseId provided in route');
      this.isLoadingCourse.set(false);
    }
  }

  private loadCourseData(courseId: number): void {
    this.isLoadingCourse.set(true);
    
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.courseData.set(course);
        this.isLoadingCourse.set(false);
        console.log('[StatisticsPage] Course loaded:', course);
      },
      error: (error) => {
        console.error('[StatisticsPage] Error loading course:', error);
        this.isLoadingCourse.set(false);
      }
    });
  }
}
