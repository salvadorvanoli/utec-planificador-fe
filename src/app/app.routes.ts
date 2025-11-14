import { Routes } from '@angular/router';
import { authGuard, contextGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('@pages/home/home').then(m => m.Home)
  },

  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then(m => m.Login)
  },

  {
    path: 'student',
    loadComponent: () => import('@layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: 'courses', loadComponent: () => import('./features/course-catalog/course-catalog').then(m => m.CourseCatalog) }
    ]
  },

  {
    path: '',
    loadComponent: () => import('@layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: 'option-page', loadComponent: () => import('./features/option-page/option-page').then(m => m.OptionPage) },
      { path: 'course-catalog', loadComponent: () => import('./features/course-catalog/course-catalog').then(m => m.CourseCatalog), canActivate: [contextGuard] },
      { path: 'statistics-page', loadComponent: () => import('./features/statistics-page/statistics-page').then(m => m.StatisticsPage), canActivate: [contextGuard] },
      { path: 'chat-page', loadComponent: () => import('./features/chat-page/chat-page').then(m => m.ChatPage), canActivate: [contextGuard] },
      { path: 'assign-page', loadComponent: () => import('./features/assign-page/assign-page').then(m => m.AssignPage), canActivate: [contextGuard] },
      { path: 'planner/:courseId', loadComponent: () => import('./features/planner/planner').then(m => m.Planner), canActivate: [contextGuard] },
    ]
  },

  { path: '**', redirectTo: 'home' }
];
