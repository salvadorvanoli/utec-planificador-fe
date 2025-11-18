import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OfficeHoursRequest, OfficeHoursResponse } from '@app/core/models/office-hours';

@Injectable({
  providedIn: 'root'
})
export class OfficeHoursService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/office-hours`;

  createOfficeHours(request: OfficeHoursRequest): Observable<OfficeHoursResponse> {
    return this.http.post<OfficeHoursResponse>(
      this.baseUrl,
      request,
      { withCredentials: true }
    );
  }

  getOfficeHoursByCourse(courseId: number): Observable<OfficeHoursResponse[]> {
    return this.http.get<OfficeHoursResponse[]>(
      `${this.baseUrl}/course/${courseId}`,
      { withCredentials: true }
    );
  }

  deleteOfficeHours(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      { withCredentials: true }
    );
  }
}
