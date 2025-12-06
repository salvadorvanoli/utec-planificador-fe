import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { PositionService, CourseService } from '../services';
import { Role } from '../enums/role';
import { map, catchError, of, mergeMap, interval } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';

/**
 * Guard que verifica si el usuario tiene acceso a un curso específico.
 * 
 * Reglas de acceso según el backend (AccessControlService):
 * - Usuario debe tener acceso al campus del curso (todos los roles)
 * - Si usuario tiene SOLO rol TEACHER: debe ser profesor del curso (ownership)
 * - Roles administrativos (ANALYST, COORDINATOR, EDUCATION_MANAGER): solo necesitan acceso al campus
 * 
 * Modos de validación:
 * - validateCourseOwnership=true: Valida en frontend que teacher sea dueño (para planner)
 * - validateCourseOwnership=false/undefined: Delega validación completa al backend (para statistics, course-details)
 * 
 * Uso en rutas:
 * {
 *   path: 'planner',
 *   component: Planner,
 *   canActivate: [authGuard, contextGuard, roleGuard, courseAccessGuard],
 *   data: { 
 *     requiredRoles: [Role.TEACHER],
 *     validateCourseOwnership: true  // Solo para planner
 *   }
 * }
 */
export const courseAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const positionService = inject(PositionService);
  const courseService = inject(CourseService);
  const router = inject(Router);

  // Obtener el courseId de los queryParams encriptados
  const queryParams: Record<string, any> = {};
  route.queryParamMap.keys.forEach(key => {
    queryParams[key] = route.queryParamMap.get(key);
  });

  const contextParams = extractContextFromUrl(queryParams);
  const courseId = contextParams?.courseId;
  
  // Para assign-page en modo creación (isEdit=false), no hay courseId y eso está bien
  if (!courseId || courseId <= 0) {
    const isAssignPage = route.routeConfig?.path === 'assign-page';
    const isEditMode = contextParams?.isEdit === true;
    
    if (isAssignPage && !isEditMode) {
      // assign-page en modo creación - permitir acceso sin courseId
      console.log('[CourseAccessGuard] assign-page in creation mode, no courseId needed');
      return true;
    }
    
    console.warn('[CourseAccessGuard] No valid courseId in encrypted context');
    router.navigate(['/option-page']);
    return false;
  }

  // Función interna para validar el acceso al curso una vez que tengamos el contexto
  const validateCourseAccess = (ctx: any) => {
    console.log('[CourseAccessGuard] Validating course access with context:', ctx);
    
    const userRoles = ctx.roles || [];
    const validateOwnership = route.data['validateCourseOwnership'] === true;

    // MODO 1: Validación de ownership en frontend (solo para planner)
    // Verifica que el usuario sea teacher del curso antes de cargar la página
    if (validateOwnership && userRoles.includes(Role.TEACHER)) {
      return courseService.getCourseById(courseId).pipe(
        map((course) => {
          const userId = positionService.userPositions()?.userId;
          
          if (!userId) {
            console.warn('[CourseAccessGuard] No userId available');
            router.navigate(['/option-page']);
            return false;
          }

          const isTeacherOfCourse = course.teachers?.some(teacher => teacher.id === userId);
          
          if (!isTeacherOfCourse) {
            console.warn(
              '[CourseAccessGuard] Teacher does not own this course',
              { userId, courseId }
            );
            router.navigate(['/course-catalog'], {
              queryParams: route.queryParams
            });
            return false;
          }

          console.log('[CourseAccessGuard] Ownership validated, access granted');
          return true;
        }),
        catchError((error) => {
          console.error('[CourseAccessGuard] Error fetching course:', error);
          
          if (error.status === 403 || error.status === 404) {
            router.navigate(['/course-catalog'], {
              queryParams: route.queryParams
            });
          } else {
            router.navigate(['/option-page']);
          }
          
          return of(false);
        })
      );
    }

    // MODO 2: Validación delegada al backend (para statistics, course-details)
    // Intenta cargar el curso - el backend ejecutará AccessControlService.validateCourseAccess()
    // que validará:
    // - Acceso al campus del curso
    // - Si usuario tiene SOLO rol TEACHER: validará ownership
    // - Si usuario tiene roles admin: solo requiere acceso al campus
    return courseService.getCourseById(courseId).pipe(
      map((course) => {
        console.log('[CourseAccessGuard] Course access validated by backend, access granted');
        return true;
      }),
      catchError((error) => {
        console.error('[CourseAccessGuard] Backend denied access to course:', error);
        
        if (error.status === 403) {
          console.warn('[CourseAccessGuard] Forbidden - user does not have access to this course');
          router.navigate(['/course-catalog'], {
            queryParams: route.queryParams
          });
        } else if (error.status === 404) {
          console.warn('[CourseAccessGuard] Course not found');
          router.navigate(['/course-catalog'], {
            queryParams: route.queryParams
          });
        } else {
          router.navigate(['/option-page']);
        }
        
        return of(false);
      })
    );
  };

  // Intentar obtener el contexto inmediatamente
  const immediateContext = positionService.selectedContext();
  
  if (immediateContext) {
    console.log('[CourseAccessGuard] Context available immediately');
    return validateCourseAccess(immediateContext);
  }

  // Si no hay contexto, esperar hasta 2 segundos a que esté disponible
  console.log('[CourseAccessGuard] Context not available, waiting...');
  
  return interval(100).pipe(
    map(() => positionService.selectedContext()),
    takeWhile((ctx) => ctx === null, true),
    take(20), // 20 * 100ms = 2 segundos máximo
    mergeMap((ctx) => {
      if (ctx) {
        console.log('[CourseAccessGuard] Context loaded after waiting');
        return validateCourseAccess(ctx);
      } else {
        console.warn('[CourseAccessGuard] Timeout waiting for context, redirecting to option-page');
        router.navigate(['/option-page']);
        return of(false);
      }
    })
  );

};
