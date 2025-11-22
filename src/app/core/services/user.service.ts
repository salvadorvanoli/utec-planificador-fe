import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserBasicResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getTeachers(campusId?: number, period?: string): Observable<UserBasicResponse[]> {
    let params = new HttpParams();
    
    if (campusId !== undefined && campusId !== null) {
      params = params.set('campusId', campusId.toString());
    }

    if (period !== undefined && period !== null && period.trim() !== '') {
      params = params.set('period', period.trim());
    }

    return this.http.get<UserBasicResponse[]>(`${this.apiUrl}/teachers`, { params });
  }

  getUsers(role?: string, campusId?: number): Observable<UserBasicResponse[]> {
    let params = new HttpParams();
    
    if (role !== undefined && role !== null) {
      params = params.set('role', role);
    }
    
    if (campusId !== undefined && campusId !== null) {
      params = params.set('campusId', campusId.toString());
    }

    return this.http.get<UserBasicResponse[]>(this.apiUrl, { 
      params,
      withCredentials: true
    });
  }
}
