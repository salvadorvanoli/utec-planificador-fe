import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que:
 * 1. Agrega credenciales (cookies) a todas las peticiones HTTP
 * 2. Maneja errores 401 (no autenticado) redirigiendo a /login
 * 3. Limpia la sesión cuando se detecta un 401
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Agregar credenciales a todas las peticiones
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401: No autenticado o sesión expirada
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        console.warn('[AuthInterceptor] 401 Unauthorized - Session expired or not authenticated');
        
        // Limpiar sesión completa y redirigir a login
        authService.clearSession();
      }

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};

