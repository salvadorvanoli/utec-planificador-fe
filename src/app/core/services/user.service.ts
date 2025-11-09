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
  private readonly apiUrl = `${environment.apiUrl}/user`;

  getUsers(role?: string, rtiId?: number): Observable<UserBasicResponse[]> {
    let params = new HttpParams();
    
    if (role !== undefined && role !== null) {
      params = params.set('role', role);
    }
    
    if (rtiId !== undefined && rtiId !== null) {
      params = params.set('rtiId', rtiId.toString());
    }

    return this.http.get<UserBasicResponse[]>(this.apiUrl, { params });
  }
}
