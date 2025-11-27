import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { PositionService, CourseService } from '../services';
import { Role } from '../enums/role';
import { map, catchError, of, mergeMap, interval } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';

/**
 * Guard que verifica si el usuario tiene acceso a un curso específico.
 * 
 * Reglas de acceso:
 * - TEACHER: Solo puede acceder a sus propios cursos
 * - ANALYST, COORDINATOR, EDUCATION_MANAGER: Pueden acceder a cursos en sus campus
 * 
 * Uso en rutas:
 * {
 *   path: 'planner/:courseId',
 *   component: Planner,
 *   canActivate: [authGuard, contextGuard, roleGuard, courseAccessGuard],
 *   data: { 
 *     requiredRoles: [Role.TEACHER],
 *     validateCourseOwnership: true // Para teachers
 *   }
 * }
 */
export const courseAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const positionService = inject(PositionService);
  const courseService = inject(CourseService);
  const router = inject(Router);

  // Obtener el courseId de los parámetros de la ruta
  const courseIdParam = route.paramMap.get('courseId');
  
  if (!courseIdParam) {
    console.warn('[CourseAccessGuard] No courseId in route parameters');
    router.navigate(['/home']);
    return false;
  }

  const courseId = parseInt(courseIdParam, 10);
  
  if (isNaN(courseId) || courseId <= 0) {
    console.warn('[CourseAccessGuard] Invalid courseId:', courseIdParam);
    router.navigate(['/home']);
    return false;
  }

  // Función interna para validar el acceso al curso una vez que tengamos el contexto
  const validateCourseAccess = (ctx: any) => {
    console.log('[CourseAccessGuard] Validating course access with context:', ctx);
    
    const userRoles = ctx.roles || [];
    const validateOwnership = route.data['validateCourseOwnership'] === true;

    // Si es TEACHER y se requiere validar ownership, verificar que sea su curso
    if (validateOwnership && userRoles.includes(Role.TEACHER)) {
      return courseService.getCourseById(courseId).pipe(
        map((course) => {
          // Verificar que el usuario autenticado sea uno de los teachers del curso
          const userId = positionService.userPositions()?.userId;
          
          if (!userId) {
            console.warn('[CourseAccessGuard] No userId available');
            router.navigate(['/home']);
            return false;
          }

          const isTeacherOfCourse = course.teachers?.some(teacher => teacher.id === userId);
          
          if (!isTeacherOfCourse) {
            console.warn(
              '[CourseAccessGuard] Teacher does not own this course',
              { userId, courseId }
            );
            router.navigate(['/home'], {
              queryParams: { error: 'not_your_course' }
            });
            return false;
          }

          return true;
        }),
        catchError((error) => {
          console.error('[CourseAccessGuard] Error fetching course:', error);
          
          // Si es 403 o 404, redirigir a home
          if (error.status === 403 || error.status === 404) {
            router.navigate(['/home'], {
              queryParams: { error: 'course_not_accessible' }
            });
          } else {
            router.navigate(['/home']);
          }
          
          return of(false);
        })
      );
    }

    // Para otros roles (ANALYST, COORDINATOR, EDUCATION_MANAGER),
    // el backend validará que el curso esté en su campus
    // El guard solo verifica que tengan el contexto correcto
    return of(true);
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
