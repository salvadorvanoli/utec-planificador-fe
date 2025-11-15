import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserPositionsResponse, SelectedContext, RegionalTechnologicalInstitute, Campus } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  readonly userPositions = signal<UserPositionsResponse | null>(null);
  readonly selectedContext = signal<SelectedContext | null>(null);
  readonly availableITRs = signal<RegionalTechnologicalInstitute[]>([]);
  readonly availableCampuses = signal<Campus[]>([]);
  readonly availableRoles = signal<string[]>([]);

  getUserPositions(): Observable<UserPositionsResponse> {
    return this.http.get<UserPositionsResponse>(`${this.apiUrl}/positions`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.userPositions.set(response);
        this.extractITRs(response);
      })
    );
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

  selectITR(itr: RegionalTechnologicalInstitute): void {
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
  }

  selectCampus(campus: Campus): void {
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
  }

  clearSelection(): void {
    this.selectedContext.set(null);
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
  }

  clearCampusSelection(): void {
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
    this.selectedContext.set(null);
  }

  clearRolesSelection(): void {
    this.availableRoles.set([]);
    if (this.selectedContext()) {
      const newContext = { ...this.selectedContext()!, roles: [] };
      this.selectedContext.set(newContext);
    }
  }

  clearAllState(): void {
    this.userPositions.set(null);
    this.selectedContext.set(null);
    this.availableITRs.set([]);
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
  }

  buildContextFromUrlParams(itrId: number, campusId: number): SelectedContext | null {
    const positions = this.userPositions();
    if (!positions) return null;

    const itr = positions.positions.find(
      position => position.isActive && position.regionalTechnologicalInstitute.id === itrId
    )?.regionalTechnologicalInstitute;

    if (!itr) return null;

    const campus = positions.positions
      .filter(position =>
        position.isActive &&
        position.regionalTechnologicalInstitute.id === itrId
      )
      .flatMap(position => position.campuses)
      .find(c => c.id === campusId);

    if (!campus) return null;

    const roles: string[] = [];
    positions.positions.forEach(position => {
      if (position.isActive &&
          position.regionalTechnologicalInstitute.id === itrId &&
          position.campuses.some(c => c.id === campusId)) {
        if (!roles.includes(position.role)) {
          roles.push(position.role);
        }
      }
    });

    this.populateAvailableCampuses(itrId);

    return { itr, campus, roles };
  }

  // Método helper para popular availableCampuses basándose en un itrId
  private populateAvailableCampuses(itrId: number): void {
    const positions = this.userPositions();
    if (!positions) return;

    const campusMap = new Map<number, Campus>();

    positions.positions.forEach(position => {
      if (position.isActive &&
          position.regionalTechnologicalInstitute.id === itrId) {
        position.campuses.forEach(campus => {
          if (!campusMap.has(campus.id)) {
            campusMap.set(campus.id, campus);
          }
        });
      }
    });

    this.availableCampuses.set(Array.from(campusMap.values()));
  }

  validateContext(itrId: number, campusId: number): boolean {
    const positions = this.userPositions();
    if (!positions) return false;

    const matchingItr = positions.positions.find(
      position => position.isActive &&
                  position.regionalTechnologicalInstitute.id === itrId
    )?.regionalTechnologicalInstitute;

    if (!matchingItr) return false;

    const matchingCampus = positions.positions
      .filter(position =>
        position.isActive &&
        position.regionalTechnologicalInstitute.id === itrId
      )
      .flatMap(position => position.campuses)
      .find(campus => campus.id === campusId);

    return !!matchingCampus;
  }
}

