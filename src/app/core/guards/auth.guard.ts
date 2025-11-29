import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';

/**
 * Guard básico de autenticación.
 * Verifica que el usuario esté autenticado antes de permitir acceso a rutas protegidas.
 * 
 * Si no está autenticado, redirige a /login para mayor seguridad.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthStatus().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      console.warn('[AuthGuard] User not authenticated, redirecting to login');
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      console.error('[AuthGuard] Error checking authentication status');
      router.navigate(['/login']);
      return of(false);
    })
  );
};

export * from './context.guard';
export * from './role.guard';
export * from './course-access.guard';

