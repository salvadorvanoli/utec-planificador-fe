import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModificationPageResponse } from '../models/modification';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/modifications`;

  /**
   * Obtiene las modificaciones de un curso con paginación
   * @param courseId ID del curso
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @returns Observable con la respuesta paginada de modificaciones
   */
  getCourseModifications(
    courseId: number,
    page: number = 0,
    size: number = 10
  ): Observable<ModificationPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ModificationPageResponse>(
      `${this.apiUrl}/courses/${courseId}`,
      { 
        params,
        withCredentials: true
      }
    );
  }
}
