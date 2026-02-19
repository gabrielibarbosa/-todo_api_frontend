import { Routes } from '@angular/router';
import { Kanban } from './kanban/kanban';

export const routes: Routes = [
  { path: 'kanban', component: Kanban },
  { path: '', pathMatch: 'full', redirectTo: 'kanban' },
  { path: '**', redirectTo: 'kanban' }
];
