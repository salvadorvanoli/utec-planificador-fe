import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor que:
 * 1. Agrega credenciales (cookies) a todas las peticiones HTTP
 * 2. Maneja errores 401 (no autenticado) y 403 (sin permisos)
 * 3. Redirige apropiadamente según el tipo de error
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Agregar credenciales a todas las peticiones
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401: No autenticado o sesión expirada
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        console.warn('[AuthInterceptor] 401 Unauthorized - Session expired or not authenticated');
        
        // Limpiar almacenamiento local
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirigir a home (página pública)
        router.navigate(['/home'], {
          queryParams: { error: 'session_expired' }
        });
      }
      
      // 403: Autenticado pero sin permisos suficientes
      else if (error.status === 403) {
        console.warn('[AuthInterceptor] 403 Forbidden - Insufficient permissions');
        
        // Redirigir a home con mensaje de error
        router.navigate(['/home'], {
          queryParams: { error: 'insufficient_permissions' }
        });
      }

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};

