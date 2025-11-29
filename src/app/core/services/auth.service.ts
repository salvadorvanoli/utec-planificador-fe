import { inject, Injectable, signal, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PositionService } from './position.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<AuthResponse | null>(null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.isAuthenticated.set(true);
        this.currentUser.set(response);
      })
    );
  }

  private clearAllState(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);

    const positionService = this.injector.get(PositionService);
    positionService.clearAllState();

    localStorage.clear();
    sessionStorage.clear();
  }

  /**
   * Clears the session and redirects to /login
   * Used when the session expires or is invalidated (401)
   */
  clearSession(): void {
    this.clearAllState();
    this.router.navigate(['/login']);
  }

  /**
   * Logs out the user by calling the backend logout endpoint
   * and redirects to /home
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.clearAllState();
        this.router.navigate(['/home']);
      },
      error: () => {
        this.clearAllState();
        this.router.navigate(['/home']);
      }
    });
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/status`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.isAuthenticated.set(true);
        this.currentUser.set(response);
      }),
      map(() => true),
      catchError(() => {
        this.clearAllState();
        return of(false);
      })
    );
  }
}

