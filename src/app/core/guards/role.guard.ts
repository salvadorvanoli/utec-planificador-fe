import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { PositionService } from '../services';
import { Role } from '../enums/role';
import { interval, of } from 'rxjs';
import { map, take, takeWhile } from 'rxjs/operators';

/**
 * Guard que verifica si el usuario tiene alguno de los roles requeridos
 * en su contexto actual (campus seleccionado).
 * 
 * IMPORTANTE: Este guard debe ejecutarse DESPUÉS de contextGuard.
 * Espera hasta 2 segundos a que el contexto esté disponible (útil en caso de refresh).
 * 
 * Uso en rutas:
 * {
 *   path: 'chat-page',
 *   component: ChatPage,
 *   canActivate: [authGuard, contextGuard, roleGuard],
 *   data: { requiredRoles: [Role.TEACHER] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const positionService = inject(PositionService);
  const router = inject(Router);

  // Obtener los roles requeridos desde la configuración de la ruta
  const requiredRoles = route.data['requiredRoles'] as Role[] | undefined;

  // Si no hay roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('[RoleGuard] No required roles specified, allowing access');
    return true;
  }

  // Función para validar roles
  const validateRoles = (): boolean | null => {
    const context = positionService.selectedContext();
    
    // Si no hay contexto aún, retornar null para seguir esperando
    if (!context) {
      return null;
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const userRoles = context.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      console.warn(
        '[RoleGuard] User does not have required roles',
        { required: requiredRoles, userHas: userRoles }
      );
      router.navigate(['/option-page'], {
        queryParams: { error: 'insufficient_permissions' }
      });
      return false;
    }

    console.log('[RoleGuard] User has required role, allowing access');
    return true;
  };

  // Intentar validación inmediata
  const immediateResult = validateRoles();
  
  // Si el contexto ya está disponible, retornar resultado inmediatamente
  if (immediateResult !== null) {
    return immediateResult;
  }

  // Si el contexto no está disponible (ej: refresh), esperar hasta 2 segundos
  console.log('[RoleGuard] Context not available yet, waiting...');
  
  return interval(100).pipe(
    map(() => validateRoles()),
    takeWhile((result) => result === null, true), // Continuar mientras sea null, incluir el último valor
    take(20), // Máximo 20 intentos (2 segundos)
    map((result) => {
      if (result === null) {
        // Timeout: después de 2 segundos aún no hay contexto
        console.error('[RoleGuard] Timeout: Context not available after 2 seconds, redirecting to option-page');
        router.navigate(['/option-page']);
        return false;
      }
      return result;
    })
  );
};
