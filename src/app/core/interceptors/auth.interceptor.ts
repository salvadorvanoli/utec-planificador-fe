import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Interceptor que:
 * 1. Agrega credenciales (cookies) a todas las peticiones HTTP
 * 2. Maneja errores 401 (no autenticado) redirigiendo a /login SOLO en rutas protegidas
 * 3. Limpia la sesión cuando se detecta un 401 en rutas protegidas
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Agregar credenciales a todas las peticiones
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401: No autenticado o sesión expirada
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Solo redirigir a login si NO estamos en una ruta pública
        const currentUrl = router.url;
        const isPublicRoute = currentUrl.includes('/student/courses') || 
                              currentUrl === '/' || 
                              currentUrl === '/home';
        
        if (!isPublicRoute) {
          console.warn('[AuthInterceptor] 401 Unauthorized in protected route - Session expired or not authenticated');
          // Limpiar sesión completa y redirigir a login
          authService.clearSession();
        } else {
          console.warn('[AuthInterceptor] 401 Unauthorized in public route - Request not authenticated, but not redirecting');
        }
      }

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};

