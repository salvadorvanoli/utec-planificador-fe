import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';
import { Home } from '@pages/home/home';
import { CourseCatalog } from './features/course-catalog/course-catalog';
import { OptionPage } from './features/option-page/option-page';
import { StatisticsPage } from './features/statistics-page/statistics-page';
import { ChatPage } from './features/chat-page/chat-page';
import { AssignPage } from './features/assign-page/assign-page';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', redirectTo: '/inicio', pathMatch: 'full' },
            {
                path: 'inicio',
                component: Home
            },
            /*
            {
                path: 'dashboard',
                loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'planning',
                loadComponent: () => import('@features/planning/planning.component').then(m => m.PlanningComponent)
            },
            {
                path: 'tasks',
                loadComponent: () => import('@features/tasks/tasks.component').then(m => m.TasksComponent)
            }
            */
        ]
    },
    { path: '', redirectTo: '/option-page?mainMenu=true', pathMatch: 'full' },
    { path: 'option-page', component: OptionPage },
    { path: 'course-catalog', component: CourseCatalog },
    { path: 'statistics-page', component: StatisticsPage },
    { path: 'chat-page', component: ChatPage },
    { path: 'assign-page', component: AssignPage }
];
