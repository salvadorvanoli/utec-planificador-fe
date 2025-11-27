import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Course, CourseBasicResponse, CourseRequest, CoursePdfData, CourseStatistics, PageResponse, PeriodResponse, MyCourseSummary, CourseDetailedInfo, TeacherPastCourse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/courses`;

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
   * Retrieves detailed information about a course
   * @param id Course ID
   * @returns Observable with the detailed course information
   */
  getDetailedInfo(id: number): Observable<CourseDetailedInfo> {
    console.log(`[CourseService] GET detailed info for course: ${id}`);
    return this.http.get<CourseDetailedInfo>(`${this.apiUrl}/${id}/detailed-info`).pipe(
      tap(response => console.log('[CourseService] Detailed info response:', response))
    );
  }

  /**
   * Updates an existing course by its ID
   * @param id Course ID
   * @param request Course update data
   * @returns Observable with the updated course
   */

/*
  updateCourse(id: number, request: CourseRequest): Observable<CourseResponse> {
    console.log(`[CourseService] PUT update course ${id}:`, request);
    return this.http.put<CourseResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(response => console.log('[CourseService] Response:', response))
    );
}
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
   * Gets the latest course for autocomplete based on curricular unit and teacher
   * @param curricularUnitId Curricular Unit ID
   * @param userId Teacher/User ID
   * @returns Observable with the latest course or null if not found
   */
  getLatestCourse(curricularUnitId: number, userId: number): Observable<Course | null> {
    const params = new HttpParams()
      .set('curricularUnitId', curricularUnitId.toString())
      .set('userId', userId.toString());
    
    return this.http.get<Course | null>(`${this.apiUrl}/latest`, { params });
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
    searchText?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<CourseBasicResponse>> {
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

    if (searchText !== undefined && searchText !== null && searchText.trim() !== '') {
      params = params.set('searchText', searchText.trim());
    }

    console.log('[CourseService] GET courses with params:', { userId, campusId, period, searchText, page, size });

    return this.http.get<PageResponse<CourseBasicResponse>>(this.apiUrl, { params }).pipe(
      tap(response => console.log('[CourseService] Courses response:', response))
    );
  }

  /**
   * Retrieves comprehensive statistics for a course
   * @param courseId Course ID
   * @returns Observable with the course statistics
   */
  getCourseStatistics(courseId: number): Observable<CourseStatistics> {
    console.log(`[CourseService] GET course statistics for courseId: ${courseId}`);
    return this.http.get<CourseStatistics>(`${this.apiUrl}/${courseId}/statistics`).pipe(
      tap(response => console.log('[CourseService] Statistics response:', response))
    );
  }

  /**
   * Retrieves the PDF data for a specific course
   * @param id Course ID
   * @returns Observable with the course PDF data
   */
  getCoursePdfData(id: number): Observable<CoursePdfData> {
    console.log(`[CourseService] GET course PDF data for ID: ${id}`);
    return this.http.get<CoursePdfData>(`${this.apiUrl}/${id}/pdf-data`).pipe(
      tap(response => console.log('[CourseService] PDF data response:', response))
    );
  }

  /**
   * Retrieves the summarized courses for the user by campus
   * @param campusId Campus ID
   * @returns Observable with the array of MyCourseSummary
   */
  getMyCoursesByCampus(campusId: number): Observable<MyCourseSummary[]> {
    const url = `${this.apiUrl}/campus/${campusId}/my-courses`;
    return this.http.get<MyCourseSummary[]>(url).pipe(
      tap(response => console.log('[CourseService] My courses response:', response))
    );
  }

  /**
   * Retrieves past courses for a teacher by curricular unit
   * @param teacherId Teacher/User ID
   * @param curricularUnitId Curricular Unit ID
   * @returns Observable with the array of TeacherPastCourse
   */
  getTeacherPastCourses(teacherId: number, curricularUnitId: number): Observable<TeacherPastCourse[]> {
    const url = `${this.apiUrl}/teacher/${teacherId}/curricular-unit/${curricularUnitId}`;
    console.log(`[CourseService] GET past courses for teacher ${teacherId} and curricular unit ${curricularUnitId}`);
    return this.http.get<TeacherPastCourse[]>(url).pipe(
      tap(response => console.log('[CourseService] Past courses response:', response))
    );
  }
}
