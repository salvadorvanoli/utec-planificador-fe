import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';
import { Home } from '@pages/home/home';
import { CourseCatalog } from './features/course-catalog/course-catalog';
import { OptionPage } from './features/option-page/option-page';
import { StatisticsPage } from './features/statistics-page/statistics-page';
import { ChatPage } from './features/chat-page/chat-page';
import { AssignPage } from './features/assign-page/assign-page';
import { Planner } from './features/planner/planner';

export const routes: Routes = [
  // Redirect root to home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Home is a top-level route (not a child of MainLayout)
  { path: 'home', component: Home },

  // MainLayout handles the rest of the app pages and always shows header/footer
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'option-page', component: OptionPage },
      { path: 'course-catalog', component: CourseCatalog },
      { path: 'statistics-page', component: StatisticsPage },
      { path: 'chat-page', component: ChatPage },
      { path: 'assign-page', component: AssignPage },
      { path: 'planner', component: Planner },
      // otras rutas hijas...
    ]
  },
  
  // fallback
  { path: '**', redirectTo: 'home' }
];