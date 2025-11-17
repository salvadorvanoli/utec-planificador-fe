import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProgrammaticContent } from '../models';
import { environment } from '../../../environments/environment';

export interface ProgrammaticContentRequest {
  title: string;
  content: string;
  color: string;
  weeklyPlanningId: number;
}

export interface ProgrammaticContentResponse extends ProgrammaticContent {}

@Injectable({
  providedIn: 'root'
})
export class ProgrammaticContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/programmatic-contents`;

  /**
   * Creates a new programmatic content
   * @param request Programmatic content creation data
   * @returns Observable with the created programmatic content
   */
  createProgrammaticContent(request: ProgrammaticContentRequest): Observable<ProgrammaticContentResponse> {
    return this.http.post<ProgrammaticContentResponse>(this.apiUrl, request);
  }

  /**
   * Retrieves a programmatic content by its ID
   * @param id Programmatic content ID
   * @returns Observable with the programmatic content data
   */
  getProgrammaticContentById(id: number): Observable<ProgrammaticContentResponse> {
    console.log(`[ProgrammaticContentService] GET programmatic content by ID: ${id}`);
    return this.http.get<ProgrammaticContentResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('[ProgrammaticContentService] Response:', response))
    );
  }

  /**
   * Updates an existing programmatic content by its ID
   * @param id Programmatic content ID
   * @param request Programmatic content update data
   * @returns Observable with the updated programmatic content
   */
  updateProgrammaticContent(id: number, request: ProgrammaticContentRequest): Observable<ProgrammaticContentResponse> {
    return this.http.put<ProgrammaticContentResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Deletes a programmatic content by its ID
   * @param id Programmatic content ID
   * @returns Observable that completes when the programmatic content is deleted
   */
  deleteProgrammaticContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
