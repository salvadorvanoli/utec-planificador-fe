import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Course, CourseRequest, PageResponse, PeriodResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/courses';

  /**
   * Creates a new course with a default weekly planning (week 1) starting on the course start date
   * @param request Course creation data
   * @returns Observable with the created course
   */
  createCourse(request: CourseRequest): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, request);
  }

  /**
   * Retrieves a course by its ID
   * @param id Course ID
   * @returns Observable with the course data
   */
  getCourseById(id: number): Observable<Course> {
    console.log(`[CourseService] GET course by ID: ${id}`);
    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('[CourseService] Response:', response))
    );
  }

  /**
   * Updates an existing course by its ID
   * @param id Course ID
   * @param request Course update data
   * @returns Observable with the updated course
   */
  updateCourse(id: number, request: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Deletes a course by its ID
   * @param id Course ID
   * @returns Observable that completes when the course is deleted
   */
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Adds a Sustainable Development Goal (SDG) to a course
   * @param courseId Course ID
   * @param goal SDG value (enum value)
   * @returns Observable with the updated course
   */
  addSustainableDevelopmentGoal(courseId: number, goal: string): Observable<Course> {
    return this.http.post<Course>(
      `${this.apiUrl}/${courseId}/sustainable-development-goals/${goal}`,
      {}
    );
  }

  /**
   * Removes a Sustainable Development Goal (SDG) from a course
   * @param courseId Course ID
   * @param goal SDG value (enum value)
   * @returns Observable with the updated course
   */
  deleteSustainableDevelopmentGoal(courseId: number, goal: string): Observable<Course> {
    return this.http.delete<Course>(
      `${this.apiUrl}/${courseId}/sustainable-development-goals/${goal}`
    );
  }

  /**
   * Adds a Universal Design for Learning (UDL) principle to a course
   * @param courseId Course ID
   * @param principle UDL principle value (enum value)
   * @returns Observable with the updated course
   */
  addUniversalDesignLearningPrinciple(courseId: number, principle: string): Observable<Course> {
    return this.http.post<Course>(
      `${this.apiUrl}/${courseId}/universal-design-learning-principles/${principle}`,
      {}
    );
  }

  /**
   * Removes a Universal Design for Learning (UDL) principle from a course
   * @param courseId Course ID
   * @param principle UDL principle value (enum value)
   * @returns Observable with the updated course
   */
  deleteUniversalDesignLearningPrinciple(courseId: number, principle: string): Observable<Course> {
    return this.http.delete<Course>(
      `${this.apiUrl}/${courseId}/universal-design-learning-principles/${principle}`
    );
  }

  /**
   * Updates the partial grading system (SCP) of a course
   * @param courseId Course ID
   * @param partialGradingSystem New partial grading system value
   * @returns Observable with the updated course
   */
  updatePartialGradingSystem(courseId: number, partialGradingSystem: string): Observable<Course> {
    return this.http.patch<Course>(
      `${this.apiUrl}/${courseId}/partial-grading-system`,
      { partialGradingSystem }
    );
  }

  /**
   * Updates the hours per delivery format of a course
   * @param courseId Course ID
   * @param hoursPerDeliveryFormat Map of delivery format to hours
   * @returns Observable with the updated course
   */
  updateHoursPerDeliveryFormat(courseId: number, hoursPerDeliveryFormat: Record<string, number>): Observable<Course> {
    return this.http.patch<Course>(
      `${this.apiUrl}/${courseId}/hours-per-delivery-format`,
      { hoursPerDeliveryFormat }
    );
  }

  getPeriodsByCampus(campusId: number): Observable<PeriodResponse[]> {
    const params = new HttpParams().set('campusId', campusId.toString());

    return this.http.get<PeriodResponse[]>(`${this.apiUrl}/periods`, {
      params,
      withCredentials: true
    });
  }

  getCourses(
    userId?: number,
    campusId?: number,
    period?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (userId !== undefined && userId !== null) {
      params = params.set('userId', userId.toString());
    }

    if (campusId !== undefined && campusId !== null) {
      params = params.set('campusId', campusId.toString());
    }

    if (period !== undefined && period !== null && period.trim() !== '') {
      params = params.set('period', period);
    }

    console.log('[CourseService] GET courses with params:', { userId, campusId, period, page, size });

    return this.http.get<PageResponse<Course>>(this.apiUrl, { params }).pipe(
      tap(response => console.log('[CourseService] Courses response:', response))
    );
  }
}
