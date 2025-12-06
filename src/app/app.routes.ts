import { Routes } from '@angular/router';
import { PdfPreview } from '@pages/pdf-preview/pdf-preview';
import { authGuard, contextGuard, roleGuard, courseAccessGuard } from './core/guards/auth.guard';
import { Role } from './core/enums/role';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ============================================
  // RUTAS PÚBLICAS (sin autenticación)
  // ============================================
  {
    path: 'home',
    loadComponent: () => import('@pages/home/home').then(m => m.Home)
  },

  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then(m => m.Login)
  },

  // Portal de estudiantes (público)
  {
    path: 'student',
    loadComponent: () => import('@layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { 
        path: 'courses', 
        loadComponent: () => import('./features/course-catalog/course-catalog').then(m => m.CourseCatalog)
      }
    ]
  },

  // ============================================
  // RUTAS PROTEGIDAS (requieren autenticación)
  // ============================================
  {
    path: '',
    loadComponent: () => import('@layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      // Option Page: Solo requiere autenticación
      { 
        path: 'option-page', 
        loadComponent: () => import('./features/option-page/option-page').then(m => m.OptionPage) 
      },

      // Course Catalog: Requiere contexto válido (ITR + Campus)
      { 
        path: 'course-catalog', 
        loadComponent: () => import('./features/course-catalog/course-catalog').then(m => m.CourseCatalog), 
        canActivate: [contextGuard] 
      },

      // Course Details: Read-only view of course information (COORDINATOR/EDUCATION_MANAGER only)
      { 
        path: 'course-details', 
        loadComponent: () => import('./features/course-details/course-details').then(m => m.CourseDetails),
        canActivate: [contextGuard, roleGuard, courseAccessGuard],
        data: { 
          requiredRoles: [Role.COORDINATOR, Role.EDUCATION_MANAGER]
        }
      },

      // Planner: Solo TEACHERS pueden acceder Y solo a sus propios cursos
      { 
        path: 'planner', 
        loadComponent: () => import('./features/planner/planner').then(m => m.Planner),
        canActivate: [contextGuard, roleGuard, courseAccessGuard],
        data: { 
          requiredRoles: [Role.TEACHER],
          validateCourseOwnership: true 
        }
      },

      // Statistics Page: TEACHERS (solo sus cursos) o COORDINATOR/EDUCATION_MANAGER (cursos del campus)
      { 
        path: 'statistics-page', 
        loadComponent: () => import('./features/statistics-page/statistics-page').then(m => m.StatisticsPage), 
        canActivate: [contextGuard, roleGuard, courseAccessGuard],
        data: { 
          requiredRoles: [Role.TEACHER, Role.COORDINATOR, Role.EDUCATION_MANAGER]
        }
      },

      // Chat Page: Solo TEACHERS
      { 
        path: 'chat-page', 
        loadComponent: () => import('./features/chat-page/chat-page').then(m => m.ChatPage), 
        canActivate: [contextGuard, roleGuard],
        data: { 
          requiredRoles: [Role.TEACHER] 
        }
      },

      // Assign Page: Solo ANALYST o COORDINATOR (con validación de curso en modo edición)
      { 
        path: 'assign-page', 
        loadComponent: () => import('./features/assign-page/assign-page').then(m => m.AssignPage), 
        canActivate: [contextGuard, roleGuard, courseAccessGuard],
        data: { 
          requiredRoles: [Role.ANALYST, Role.COORDINATOR] 
        }
      },

      // PDF Preview: Requiere contexto y acceso al curso específico
      { 
        path: 'pdf-preview', 
        component: PdfPreview,
        canActivate: [contextGuard, courseAccessGuard]
      }
    ]
  },

  // Redirect cualquier ruta no encontrada a home
  { path: '**', redirectTo: 'home' }
];
