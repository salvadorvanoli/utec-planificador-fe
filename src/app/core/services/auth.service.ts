import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8083/api/v1/auth';

  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_DATA_KEY = 'user_data';

  // Signal para manejar el estado de autenticación
  readonly isAuthenticated = signal<boolean>(this.hasValidToken());
  readonly currentUser = signal<AuthResponse | null>(this.getUserData());

  /**
   * Realiza el login del usuario
   * @param credentials Credenciales de acceso (email y contraseña)
   * @returns Observable con la respuesta de autenticación
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
        this.isAuthenticated.set(true);
        this.currentUser.set(response);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/home']);
  }

  /**
   * Guarda los datos de sesión en localStorage
   */
  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(authResult));
  }

  /**
   * Obtiene el token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si existe un token válido
   */
  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene los datos del usuario guardados
   */
  private getUserData(): AuthResponse | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}

