import { Component, ChangeDetectionStrategy, inject, signal, effect, output } from '@angular/core';
import { CourseService, PositionService, AiAgentService } from '@app/core/services';
import { CourseBasicResponse } from '@app/core/models';
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

  readonly courses = signal<CourseBasicResponse[]>([]);
  readonly selectedCourse = signal<CourseBasicResponse | null>(null);
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
    this.courseService.getCourses(undefined, campusId, undefined, undefined, 0, 100)
      .pipe(finalize(() => this.isLoadingCourses.set(false)))
      .subscribe({
        next: (response) => {
          this.courses.set(response.content);
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.courses.set([]);
        }
      });
  }

  onCourseChange(course: CourseBasicResponse | null): void {
    this.selectedCourse.set(course);
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
    const course = this.selectedCourse();
    if (course) {
      this.showSuggestions.emit({
        courseId: course.id,
        courseName: course.description
      });
    }
  }

  get courseOptions(): { label: string; value: CourseBasicResponse }[] {
    return this.courses().map(course => ({
      label: `${course.description} - ${course.startDate}`,
      value: course
    }));
  }
}

