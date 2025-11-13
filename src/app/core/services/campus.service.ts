import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CampusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/campuses`;

  getCampuses(userId?: number): Observable<Campus[]> {
    let params = new HttpParams();
    
    if (userId !== undefined && userId !== null) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<Campus[]>(this.apiUrl, { params });
  }
}
