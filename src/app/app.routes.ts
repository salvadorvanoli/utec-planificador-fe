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
    { path: '', redirectTo: '/option-page?mainMenu=true', pathMatch: 'full' },
    { path: 'option-page', component: OptionPage },
    { path: 'course-catalog', component: CourseCatalog },
    { path: 'statistics-page', component: StatisticsPage },
    { path: 'chat-page', component: ChatPage },
    { path: 'assign-page', component: AssignPage },
    { path: 'planner', component: Planner }
];
