import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PositionService } from '../services';
import { map, catchError, of } from 'rxjs';

export const contextGuard: CanActivateFn = () => {
  const positionService = inject(PositionService);
  const router = inject(Router);

  const context = positionService.selectedContext();

  if (!context || !context.campus) {
    router.navigate(['/option-page']);
    return false;
  }

  const positions = positionService.userPositions();

  if (!positions) {
    return positionService.getUserPositions().pipe(
      map(() => {
        if (validateContext()) {
          return true;
        }
        positionService.clearAllState();
        router.navigate(['/option-page']);
        return false;
      }),
      catchError(() => {
        positionService.clearAllState();
        router.navigate(['/option-page']);
        return of(false);
      })
    );
  }

  if (!validateContext()) {
    positionService.clearAllState();
    router.navigate(['/option-page']);
    return false;
  }

  return true;

  function validateContext(): boolean {
    const positions = positionService.userPositions();
    if (!positions || !context) return false;

    const matchingItr = positions.positions.find(
      position => position.isActive &&
                  position.regionalTechnologicalInstitute.id === context.itr.id
    )?.regionalTechnologicalInstitute;

    if (!matchingItr) return false;

    if (matchingItr.name !== context.itr.name) {
      return false;
    }

    const matchingCampus = positions.positions
      .filter(position =>
        position.isActive &&
        position.regionalTechnologicalInstitute.id === context.itr.id
      )
      .flatMap(position => position.campuses)
      .find(campus => campus.id === context.campus.id);

    if (!matchingCampus) return false;

    if (matchingCampus.name !== context.campus.name) {
      return false;
    }

    const validRoles = positions.positions
      .filter(position =>
        position.isActive &&
        position.regionalTechnologicalInstitute.id === context.itr.id &&
        position.campuses.some(campus => campus.id === context.campus.id)
      )
      .map(position => position.role);

    if (validRoles.length !== context.roles.length) {
      return false;
    }

    const allRolesValid = context.roles.every(role => validRoles.includes(role));
    if (!allRolesValid) return false;

    const allBackendRolesInContext = validRoles.every(role => context.roles.includes(role));
    if (!allBackendRolesInContext) return false;

    return true;
  }
};

