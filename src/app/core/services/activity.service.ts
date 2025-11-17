import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Activity } from '../models';
import { environment } from '../../../environments/environment';

export interface ActivityRequest {
  title: string;
  description: string;
  color: string;
  durationInMinutes: number;
  cognitiveProcesses: string[];
  transversalCompetencies: string[];
  learningModality: string;
  teachingStrategies: string[];
  learningResources: string[];
  programmaticContentId: number;
}

export interface ActivityResponse extends Activity {}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/activities`;

  /**
   * Creates a new activity
   * @param request Activity creation data
   * @returns Observable with the created activity
   */
  createActivity(request: ActivityRequest): Observable<ActivityResponse> {
    console.log('[ActivityService] POST create activity:', request);
    return this.http.post<ActivityResponse>(this.apiUrl, request).pipe(
      tap(response => console.log('[ActivityService] Activity created:', response))
    );
  }

  /**
   * Retrieves an activity by its ID
   * @param id Activity ID
   * @returns Observable with the activity data
   */
  getActivityById(id: number): Observable<ActivityResponse> {
    console.log(`[ActivityService] GET activity by ID: ${id}`);
    return this.http.get<ActivityResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('[ActivityService] Response:', response))
    );
  }

  /**
   * Updates an existing activity by its ID
   * @param id Activity ID
   * @param request Activity update data
   * @returns Observable with the updated activity
   */
  updateActivity(id: number, request: ActivityRequest): Observable<ActivityResponse> {
    console.log('[ActivityService] PUT update activity:', id, request);
    return this.http.put<ActivityResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(response => console.log('[ActivityService] Activity updated successfully:', response))
    );
  }

  /**
   * Deletes an activity by its ID
   * @param id Activity ID
   * @returns Observable that completes when the activity is deleted
   */
  deleteActivity(id: number): Observable<void> {
    console.log('[ActivityService] DELETE activity:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('[ActivityService] Activity deleted successfully:', id))
    );
  }
}
