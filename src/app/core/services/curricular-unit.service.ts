import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurricularUnitResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CurricularUnitService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/curricular-units`;

  getCurricularUnits(campusId?: number): Observable<CurricularUnitResponse[]> {
    let params = new HttpParams();
    
    if (campusId !== undefined && campusId !== null) {
      params = params.set('campusId', campusId.toString());
    }

    return this.http.get<CurricularUnitResponse[]>(this.apiUrl, { params });
  }

  getCurricularUnitById(id: number): Observable<CurricularUnitResponse> {
    return this.http.get<CurricularUnitResponse>(`${this.apiUrl}/${id}`);
  }
}
