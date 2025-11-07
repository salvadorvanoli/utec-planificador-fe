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
  private readonly apiUrl = `${environment.apiUrl}/user`;

  readonly userPositions = signal<UserPositionsResponse | null>(null);
  readonly selectedContext = signal<SelectedContext | null>(null);
  readonly availableITRs = signal<RegionalTechnologicalInstitute[]>([]);
  readonly availableCampuses = signal<Campus[]>([]);
  readonly availableRoles = signal<string[]>([]);

  getUserPositions(): Observable<UserPositionsResponse> {
    console.log('[PositionService] Fetching user positions from:', `${this.apiUrl}/positions`);
    return this.http.get<UserPositionsResponse>(`${this.apiUrl}/positions`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('[PositionService] Response received:', response);
        this.userPositions.set(response);
        this.extractITRs(response);
        console.log('[PositionService] Available ITRs:', this.availableITRs());
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
    console.log('[PositionService] Extracted ITRs:', Array.from(itrMap.values()));
  }

  selectITR(itr: RegionalTechnologicalInstitute): void {
    console.log('[PositionService] Selecting ITR:', itr);
    const positions = this.userPositions();
    if (!positions) return;

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
    console.log('[PositionService] Available campuses for ITR:', Array.from(campusMap.values()));

    if (this.selectedContext()) {
      this.selectedContext.update(ctx => ctx ? { ...ctx, itr } : null);
    } else {
      this.selectedContext.set({ itr, campus: null as any, roles: [] });
    }
  }

  selectCampus(campus: Campus): void {
    console.log('[PositionService] Selecting Campus:', campus);
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
    console.log('[PositionService] Available roles for campus:', roles);
    this.selectedContext.update(ctx =>
      ctx ? { ...ctx, campus, roles } : null
    );
  }

  clearSelection(): void {
    this.selectedContext.set(null);
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
  }

  clearCampusSelection(): void {
    this.availableCampuses.set([]);
    this.availableRoles.set([]);
    if (this.selectedContext()) {
      this.selectedContext.update(ctx =>
        ctx ? { ...ctx, campus: null as any, roles: [] } : null
      );
    }
  }

  clearRolesSelection(): void {
    this.availableRoles.set([]);
    if (this.selectedContext()) {
      this.selectedContext.update(ctx =>
        ctx ? { ...ctx, roles: [] } : null
      );
    }
  }
}

