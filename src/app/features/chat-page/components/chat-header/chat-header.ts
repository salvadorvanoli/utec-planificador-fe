import { Component, ChangeDetectionStrategy, inject, signal, effect, output } from '@angular/core';
import { CourseService, PositionService, AiAgentService } from '@app/core/services';
import { MyCourseSummary } from '@app/core/models';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-chat-header',
  imports: [Select, FormsModule, TooltipModule],
  templateUrl: './chat-header.html',
  styleUrl: './chat-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHeader {
  private readonly courseService = inject(CourseService);
  private readonly positionService = inject(PositionService);
  private readonly aiAgentService = inject(AiAgentService);


  readonly courses = signal<MyCourseSummary[]>([]);
  readonly selectedCourse = signal<MyCourseSummary | null>(null);
  // Allow the model to hold either the raw option `{label, value}` or the course object/ID
  selectedCourseModel: any = null;
  readonly isLoadingCourses = signal<boolean>(false);
  readonly isClearing = signal<boolean>(false);
  readonly showSuggestions = output<{ courseId: number; courseName: string }>();

  constructor() {
    effect(() => {
      const context = this.positionService.selectedContext();
      if (context?.campus) {
        this.loadCourses(context.campus.id);
      }
    }, { allowSignalWrites: true });
  }

  private loadCourses(campusId: number): void {
    this.isLoadingCourses.set(true);

    this.courseService.getMyCoursesByCampus(campusId)
      .pipe(finalize(() => this.isLoadingCourses.set(false)))
      .subscribe({
        next: (response) => {
          this.courses.set(response);
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.courses.set([]);
        }
      });
  }


  onCourseChange(course: MyCourseSummary | null | any): void {
    let resolved: MyCourseSummary | null = null;

    if (course == null) {
      resolved = null;
    } else if (typeof course === 'object' && 'value' in course) {
      resolved = course.value ?? null;
    } else {
      resolved = course as MyCourseSummary;
    }

    this.selectedCourse.set(resolved);
    this.selectedCourseModel = course;
  }

  clearSession(): void {
    this.isClearing.set(true);
    this.aiAgentService.clearChatSession()
      .pipe(finalize(() => this.isClearing.set(false)))
      .subscribe({
        next: () => {
          console.log('Session cleared successfully');
          window.location.reload();
        },
        error: (error) => {
          console.error('Error clearing session:', error);
        }
      });
  }

  requestSuggestions(): void {
    const selectedSignalCourse = this.selectedCourse();
    const selectedModel = this.selectedCourseModel as unknown;

    let course: MyCourseSummary | null = null;

    if (selectedSignalCourse) {
      course = selectedSignalCourse;
    } else {
      course = selectedModel as MyCourseSummary;
    }

    if (!course) {
      console.warn('No course selected when requesting suggestions');
      return;
    }

    this.selectedCourse.set(course);

    const payload = {
      courseId: course.id,
      courseName: course.curricularUnitName
    };

    this.showSuggestions.emit(payload);
  }

  get courseOptions(): { label: string; value: MyCourseSummary }[] {
    return this.courses().map(course => ({
      label: `${course.id} - ${course.curricularUnitName} - ${course.startDate} - ${((course.shift || '')[0] || '').toUpperCase()}`,
      value: course
    }));
  }
}
