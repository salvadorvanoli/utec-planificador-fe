import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
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

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
        sessionStorage.clear();
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
        sessionStorage.clear();
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
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
        return of(false);
      })
    );
  }
}

