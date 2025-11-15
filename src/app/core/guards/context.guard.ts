import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { PositionService } from '../services';
import { map, catchError, of } from 'rxjs';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';

export const contextGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const positionService = inject(PositionService);
  const router = inject(Router);

  try {
    // Extraer el contexto de la URL (SOLO formato codificado)
    const queryParams: Record<string, any> = {};
    route.queryParamMap.keys.forEach(key => {
      queryParams[key] = route.queryParamMap.get(key);
    });

    const contextParams = extractContextFromUrl(queryParams);

    // Si el contexto no se pudo extraer (sin token ctx, token inválido o corrupto), redirigir
    if (!contextParams) {
      console.warn('[ContextGuard] Missing or invalid encoded context (ctx parameter required), redirecting to option-page');
      router.navigate(['/option-page']);
      return false;
    }

    const itrIdNum = contextParams.itrId;
    const campusIdNum = contextParams.campusId;

    // Validar que los IDs sean números válidos y positivos
    // campusId debe ser > 0 (no aceptamos -1 que significa "sin campus")
    if (!itrIdNum || itrIdNum <= 0 || !campusIdNum || campusIdNum <= 0) {
      console.warn('[ContextGuard] Invalid ID values, redirecting to option-page');
      router.navigate(['/option-page']);
      return false;
    }

  const positions = positionService.userPositions();

  if (!positions) {
    return positionService.getUserPositions().pipe(
      map(() => {
        if (positionService.validateContext(itrIdNum, campusIdNum)) {
          const context = positionService.buildContextFromUrlParams(itrIdNum, campusIdNum);
          if (context) {
            positionService.selectedContext.set(context);
            positionService.availableRoles.set(context.roles);
            return true;
          }
        }
        router.navigate(['/option-page']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/option-page']);
        return of(false);
      })
    );
  }

  // Validar que el contexto es válido
  if (!positionService.validateContext(itrIdNum, campusIdNum)) {
    router.navigate(['/option-page']);
    return false;
  }

  // Construir y setear el contexto si es válido
  const context = positionService.buildContextFromUrlParams(itrIdNum, campusIdNum);
  if (context) {
    positionService.selectedContext.set(context);
    positionService.availableRoles.set(context.roles);
    return true;
  }

  router.navigate(['/option-page']);
  return false;
  } catch (error) {
    // Cualquier error inesperado, redirigir a selección de ITR
    console.error('[ContextGuard] Unexpected error:', error);
    router.navigate(['/option-page']);
    return false;
  }
};

