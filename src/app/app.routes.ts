import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';
import { Home } from '@pages/home/home';
import { Login } from '@pages/login/login';
import { CourseCatalog } from './features/course-catalog/course-catalog';
import { OptionPage } from './features/option-page/option-page';
import { StatisticsPage } from './features/statistics-page/statistics-page';
import { ChatPage } from './features/chat-page/chat-page';
import { AssignPage } from './features/assign-page/assign-page';
import { Planner } from './features/planner/planner';
import { PdfPreview } from '@pages/pdf-preview/pdf-preview';
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
      { path: 'statistics-page/:courseId', loadComponent: () => import('./features/statistics-page/statistics-page').then(m => m.StatisticsPage), canActivate: [contextGuard] },
      { path: 'chat-page', loadComponent: () => import('./features/chat-page/chat-page').then(m => m.ChatPage), canActivate: [contextGuard] },
      { path: 'assign-page', loadComponent: () => import('./features/assign-page/assign-page').then(m => m.AssignPage), canActivate: [contextGuard] },
      { path: 'planner/:courseId', loadComponent: () => import('./features/planner/planner').then(m => m.Planner)},
      { path: 'pdf-preview/:courseId', component: PdfPreview }
    ]
  },

  { path: '**', redirectTo: 'home' }
];
