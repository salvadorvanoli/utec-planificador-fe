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

  // Función helper para validar y construir contexto a partir de las posiciones cargadas
  const validateAndSetContext = (loadedPositions: any): boolean => {
    // Validar que el ITR exista en las posiciones del usuario
    const matchingItr = loadedPositions.positions.find(
      (position: any) => position.isActive &&
                        position.regionalTechnologicalInstitute.id === itrIdNum
    )?.regionalTechnologicalInstitute;

    if (!matchingItr) {
      console.warn('[ContextGuard] No matching ITR found in user positions');
      router.navigate(['/option-page']);
      return false;
    }

    // Validar que el campus exista en las posiciones del usuario para ese ITR
    const matchingCampus = loadedPositions.positions
      .filter((position: any) =>
        position.isActive &&
        position.regionalTechnologicalInstitute.id === itrIdNum
      )
      .flatMap((position: any) => position.campuses)
      .find((campus: any) => campus.id === campusIdNum);

    if (!matchingCampus) {
      console.warn('[ContextGuard] No matching campus found in user positions');
      router.navigate(['/option-page']);
      return false;
    }

    // Construir y setear el contexto
    const context = positionService.buildContextFromUrlParams(itrIdNum, campusIdNum);
    if (context) {
      console.log('[ContextGuard] Context validated and set:', { itrId: itrIdNum, campusId: campusIdNum });
      positionService.selectedContext.set(context);
      positionService.availableRoles.set(context.roles);
      return true;
    }

    console.warn('[ContextGuard] Could not build context');
    router.navigate(['/option-page']);
    return false;
  };

  const positions = positionService.userPositions();

  // Si las posiciones no están cargadas (ej: refresh de página)
  if (!positions) {
    console.log('[ContextGuard] Positions not loaded, fetching from server...');
    
    return positionService.getUserPositions().pipe(
      map((loadedPositions) => {
        console.log('[ContextGuard] Positions loaded successfully:', loadedPositions);
        return validateAndSetContext(loadedPositions);
      }),
      catchError((error) => {
        console.error('[ContextGuard] Error loading positions:', error);
        router.navigate(['/option-page']);
        return of(false);
      })
    );
  }

  // Si las posiciones ya están cargadas, validar directamente
  return validateAndSetContext(positions);
  } catch (error) {
    // Cualquier error inesperado, redirigir a selección de ITR
    console.error('[ContextGuard] Unexpected error:', error);
    router.navigate(['/option-page']);
    return false;
  }
};
