import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './core/guards';
import { P } from './core/models';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in · PMRDA Smart City – Tree Cutting NOC Management System',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · PMRDA',
        loadComponent: () => import('./pages/dashboard').then((m) => m.Dashboard),
      },
      // ---- Applicant ----
      {
        path: 'applications',
        canActivate: [permissionGuard(P.applicationsView)],
        title: 'My Applications · PMRDA',
        loadComponent: () => import('./pages/applicant/my-applications').then((m) => m.MyApplications),
      },
      {
        path: 'applications/new',
        canActivate: [permissionGuard(P.applicationsCreate)],
        title: 'New Application · PMRDA',
        loadComponent: () => import('./pages/applicant/application-form').then((m) => m.ApplicationForm),
      },
      {
        path: 'applications/:id',
        canActivate: [permissionGuard(P.applicationsView)],
        title: 'Application Detail · PMRDA',
        loadComponent: () => import('./pages/applicant/application-view').then((m) => m.ApplicationView),
      },
      {
        path: 'applications/:id/edit',
        canActivate: [permissionGuard(P.applicationsEdit)],
        title: 'Edit Application · PMRDA',
        loadComponent: () => import('./pages/applicant/application-form').then((m) => m.ApplicationForm),
      },
      // ---- Staff review ----
      {
        path: 'review',
        canActivate: [permissionGuard(P.scrutinyView)],
        title: 'Review Queue · PMRDA',
        loadComponent: () => import('./pages/staff/review-list').then((m) => m.ReviewList),
      },
      {
        path: 'review/:id',
        canActivate: [permissionGuard(P.scrutinyView)],
        title: 'Review Application · PMRDA',
        loadComponent: () => import('./pages/staff/review-detail').then((m) => m.ReviewDetail),
      },
      {
        path: 'review/:id/inspection',
        canActivate: [permissionGuard(P.inspectionSubmit)],
        title: 'Inspection Report · PMRDA',
        loadComponent: () => import('./pages/staff/inspection-report').then((m) => m.InspectionReport),
      },
      // ---- Admin ----
      {
        path: 'admin/users',
        canActivate: [permissionGuard(P.usersView)],
        title: 'Users · PMRDA',
        loadComponent: () => import('./pages/admin/users').then((m) => m.Users),
      },
      {
        path: 'forbidden',
        title: 'Not allowed · PMRDA',
        loadComponent: () => import('./pages/status-pages').then((m) => m.Forbidden),
      },
      {
        path: '**',
        title: 'Not found · PMRDA',
        loadComponent: () => import('./pages/status-pages').then((m) => m.NotFound),
      },
    ],
  },
];
