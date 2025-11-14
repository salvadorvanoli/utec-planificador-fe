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

  { path: 'home', component: Home },

  { path: 'login', component: Login },

  {
    path: 'student',
    component: MainLayout,
    children: [
      { path: 'courses', component: CourseCatalog }
    ]
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'option-page', component: OptionPage },
      { path: 'course-catalog', component: CourseCatalog, canActivate: [contextGuard] },
      { path: 'statistics-page', component: StatisticsPage, canActivate: [contextGuard] },
      { path: 'chat-page', component: ChatPage, canActivate: [contextGuard] },
      { path: 'assign-page', component: AssignPage, canActivate: [contextGuard] },
      { path: 'planner/:courseId', component: Planner },
      { path: 'pdf-preview/:courseId', component: PdfPreview },
    ]
  },

  { path: '**', redirectTo: 'home' }
];
