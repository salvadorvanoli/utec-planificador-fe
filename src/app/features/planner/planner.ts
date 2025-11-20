import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WeeklyPlan } from './components/weekly-plan/weekly-plan';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { Titulo } from '@app/shared/components/titulo/titulo';
import { CourseInfo } from '@app/shared/components/course-info/course-info';
import { CourseService, PdfService } from '@app/core/services';
import { Course } from '@app/core/models';
import { Tooltip } from 'primeng/tooltip';
import { ChangeHistory } from './components/change-history/change-history';

@Component({
  selector: 'app-planner',
  imports: [WeeklyPlan, SectionHeader, Titulo, CourseInfo, Tooltip, ChangeHistory],
  templateUrl: './planner.html',
  styleUrl: './planner.scss'
})
export class Planner implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly pdfService = inject(PdfService);
  private readonly router = inject(Router);
  
  readonly InfoType = InfoType;
  
  courseData = signal<Course | null>(null);
  isLoadingCourse = signal(true);
  showHistoryModal = signal(false);
  isGeneratingPdf = signal(false);

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

  openHistoryModal(): void {
    this.showHistoryModal.set(true);
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
  }

  async downloadPdf(): Promise<void> {
    const courseId = this.courseData()?.id;
    
    if (!courseId) {
      console.error('No course ID available');
      return;
    }

    this.isGeneratingPdf.set(true);

    try {
      await this.pdfService.generateCoursePdf(courseId);
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }
}
