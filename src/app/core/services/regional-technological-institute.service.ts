import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegionalTechnologicalInstitute } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RegionalTechnologicalInstituteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/regional-technological-institutes`;

  getRegionalTechnologicalInstitutes(userId?: number): Observable<RegionalTechnologicalInstitute[]> {
    let params = new HttpParams();
    
    if (userId !== undefined && userId !== null) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<RegionalTechnologicalInstitute[]>(this.apiUrl, { params });
  }
}
