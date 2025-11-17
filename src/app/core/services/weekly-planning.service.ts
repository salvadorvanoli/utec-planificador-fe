import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { WeeklyPlanning } from '../models';
import { environment } from '../../../environments/environment';

export interface WeeklyPlanningRequest {
  weekNumber: number;
  startDate: string;
  endDate: string;
  bibliographicReferences: string[];
}

export interface WeeklyPlanningResponse extends WeeklyPlanning {}

@Injectable({
  providedIn: 'root'
})
export class WeeklyPlanningService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/weekly-plannings`;

  /**
   * Creates a new weekly planning for a course
   * @param courseId Course ID
   * @param request Weekly planning creation data
   * @returns Observable with the created weekly planning
   */
  createWeeklyPlanning(courseId: number, request: WeeklyPlanningRequest): Observable<WeeklyPlanningResponse> {
    return this.http.post<WeeklyPlanningResponse>(`${this.apiUrl}/course/${courseId}`, request);
  }

  /**
   * Retrieves a weekly planning by its ID
   * @param id Weekly planning ID
   * @returns Observable with the weekly planning data
   */
  getWeeklyPlanningById(id: number): Observable<WeeklyPlanningResponse> {
    console.log(`[WeeklyPlanningService] GET weekly planning by ID: ${id}`);
    return this.http.get<WeeklyPlanningResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('[WeeklyPlanningService] Response:', response))
    );
  }

  /**
   * Updates an existing weekly planning by its ID
   * @param id Weekly planning ID
   * @param request Weekly planning update data
   * @returns Observable with the updated weekly planning
   */
  updateWeeklyPlanning(id: number, request: WeeklyPlanningRequest): Observable<WeeklyPlanningResponse> {
    return this.http.put<WeeklyPlanningResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Deletes a weekly planning by its ID
   * @param id Weekly planning ID
   * @returns Observable that completes when the weekly planning is deleted
   */
  deleteWeeklyPlanning(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Gets all weekly plannings for a specific course
   * @param courseId Course ID
   * @returns Observable with array of weekly plannings
   */
  getAllWeeklyPlanningsByCourse(courseId: number): Observable<WeeklyPlanningResponse[]> {
    console.log(`[WeeklyPlanningService] GET all weekly plannings for course: ${courseId}`);
    return this.http.get<WeeklyPlanningResponse[]>(`${this.apiUrl}/course/${courseId}`).pipe(
      tap(response => console.log('[WeeklyPlanningService] Response:', response))
    );
  }

  /**
   * Gets a weekly planning by course ID and date
   * @param courseId Course ID
   * @param date Date in format YYYY-MM-DD
   * @returns Observable with the weekly planning data
   */
  getWeeklyPlanningByCourseAndDate(courseId: number, date: string): Observable<WeeklyPlanningResponse> {
    console.log(`[WeeklyPlanningService] GET weekly planning for course ${courseId} and date: ${date}`);
    return this.http.get<WeeklyPlanningResponse>(`${this.apiUrl}/course/${courseId}/date`, {
      params: { date }
    }).pipe(
      tap(response => console.log('[WeeklyPlanningService] Response:', response))
    );
  }

  /**
   * Gets a weekly planning by course ID and week number
   * @param courseId Course ID
   * @param weekNumber Week number
   * @returns Observable with the weekly planning data
   */
  getWeeklyPlanningByCourseAndWeekNumber(courseId: number, weekNumber: number): Observable<WeeklyPlanningResponse> {
    console.log(`[WeeklyPlanningService] GET weekly planning for course ${courseId} and week: ${weekNumber}`);
    return this.http.get<WeeklyPlanningResponse>(`${this.apiUrl}/course/${courseId}/week/${weekNumber}`).pipe(
      tap(response => console.log('[WeeklyPlanningService] Response:', response))
    );
  }
}
