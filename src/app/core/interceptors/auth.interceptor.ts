import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    tap({
      error: (error) => {
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          localStorage.clear();
          sessionStorage.clear();
          router.navigate(['/login']);
        }
      }
    })
  );
};

