import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';
import {inject} from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir a login si no está autenticado
  router.navigate(['/login']);
  return false;
};

