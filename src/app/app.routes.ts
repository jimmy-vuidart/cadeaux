import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'lists/:id', loadComponent: () => import('./pages/list/list').then((m) => m.ListPage) },
  { path: 'account', loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage) },
];
