import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserPositionsResponse, SelectedContext, RegionalTechnologicalInstitute, Campus, PeriodResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/user`;
  private readonly STORAGE_KEY = 'selected_context';

  readonly userPositions = signal<UserPositionsResponse | null>(null);
  readonly selectedContext = signal<SelectedContext | null>(this.loadContextFromStorage());
  readonly availableITRs = signal<RegionalTechnologicalInstitute[]>([]);
  readonly availableCampuses = signal<Campus[]>([]);
  readonly availableRoles = signal<string[]>([]);

  private loadContextFromStorage(): SelectedContext | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[PositionService] Error loading context from storage:', error);
    }
    return null;
  }

  private saveContextToStorage(context: SelectedContext | null): void {
    try {
      if (context) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
      } else {
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('[PositionService] Error saving context to storage:', error);
    }
  }

  getUserPositions(): Observable<UserPositionsResponse> {
    const storedContext = this.selectedContext();

    return this.http.get<UserPositionsResponse>(`${this.apiUrl}/positions`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.userPositions.set(response);
        this.extractITRs(response);

        if (storedContext) {
          if (storedContext.itr) {
            this.selectITR(storedContext.itr, false);
          }

          if (storedContext.campus) {
            this.selectCampus(storedContext.campus, false);
          }
        }
      })
    );
  }

  getUserPeriodsByCampus(campusId: number): Observable<PeriodResponse[]> {
    const params = new HttpParams().set('campusId', campusId.toString());

    return this.http.get<PeriodResponse[]>(`${this.apiUrl}/periods`, {
      params,
      withCredentials: true
    });
  }

  private extractITRs(positions: UserPositionsResponse): void {
    const itrMap = new Map<number, RegionalTechnologicalInstitute>();

    positions.positions.forEach(position => {
      if (position.isActive && position.regionalTechnologicalInstitute) {
        const itr = position.regionalTechnologicalInstitute;
        if (!itrMap.has(itr.id)) {
          itrMap.set(itr.id, itr);
        }
      }
    });

    this.availableITRs.set(Array.from(itrMap.values()));
  }

  selectITR(itr: RegionalTechnologicalInstitute, save: boolean = true): void {
    const positions = this.userPositions();

    if (!positions) {
      return;
    }

    const campusMap = new Map<number, Campus>();

    positions.positions.forEach(position => {
      if (position.isActive &&
          position.regionalTechnologicalInstitute.id === itr.id) {
        position.campuses.forEach(campus => {
          if (!campusMap.has(campus.id)) {
            campusMap.set(campus.id, campus);
          }
        });
      }
    });

    this.availableCampuses.set(Array.from(campusMap.values()));

    const newContext = this.selectedContext()
      ? { ...this.selectedContext()!, itr }
      : { itr, campus: null as any, roles: [] };

    this.selectedContext.set(newContext);

    if (save) {
      this.saveContextToStorage(newContext);
    }
  }

  selectCampus(campus: Campus, save: boolean = true): void {
    const positions = this.userPositions();
    const context = this.selectedContext();
    if (!positions || !context) return;

    const roles: string[] = [];

    positions.positions.forEach(position => {
      if (position.isActive &&
          position.regionalTechnologicalInstitute.id === context.itr.id &&
          position.campuses.some(c => c.id === campus.id)) {
        if (!roles.includes(position.role)) {
          roles.push(position.role);
        }
      }
    });

    this.availableRoles.set(roles);

    const newContext = { ...context, campus, roles };
    this.selectedContext.set(newContext);

    if (save) {
      this.saveContextToStorage(newContext);
    }
  }

  clearSelection(): void {
    this.selectedContext.set(null);
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
    this.saveContextToStorage(null);
  }

  clearCampusSelection(): void {
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
    this.selectedContext.set(null);
    this.saveContextToStorage(null);
  }

  clearRolesSelection(): void {
    this.availableRoles.set([]);
    if (this.selectedContext()) {
      const newContext = { ...this.selectedContext()!, roles: [] };
      this.selectedContext.set(newContext);
      this.saveContextToStorage(newContext);
    }
  }

  clearAllState(): void {
    this.userPositions.set(null);
    this.selectedContext.set(null);
    this.availableITRs.set([]);
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}

