import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SystemRole } from '../../core/models';

interface UserRow {
  id: number; name: string; loginName: string; email: string;
  role: SystemRole; mobile: string; isActive: boolean;
}

const DEMO_USERS: UserRow[] = [
  { id: 1, name: 'Rajesh Patil', loginName: 'rajesh.patil', email: 'rajesh@example.com', role: 'Applicant', mobile: '9876543210', isActive: true },
  { id: 2, name: 'Savita Jadhav', loginName: 'savita.jadhav', email: 'savita@pmrda.gov.in', role: 'Assistant', mobile: '9823000111', isActive: true },
  { id: 3, name: 'Ganesh More', loginName: 'ganesh.more', email: 'ganesh@pmrda.gov.in', role: 'Superintendent', mobile: '9823000222', isActive: true },
  { id: 4, name: 'Anand Jagtap', loginName: 'anand.jagtap', email: 'anand@pmrda.gov.in', role: 'Authority', mobile: '9823000333', isActive: true },
  { id: 5, name: 'Admin User', loginName: 'admin', email: 'admin@pmrda.gov.in', role: 'SuperAdmin', mobile: '9823000000', isActive: true },
];

const ROLE_BADGE: Record<SystemRole, string> = {
  Applicant: 'badge-secondary', Assistant: 'badge-info', Superintendent: 'badge-warning',
  Authority: 'badge-success', SuperAdmin: 'badge-danger',
};

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>User Management</h1>
        <div class="breadcrumb"><a routerLink="/">Home</a><span>/</span><span>Users</span></div>
      </div>
      <button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add User</button>
    </div>

    <div class="panel">
      <div class="panel-heading"><h3>System Users ({{ users().length }})</h3></div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>Name</th><th>Login Name</th><th>Role</th><th>Mobile</th><th>Email</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td><strong>{{ u.name }}</strong></td>
                <td><code style="font-size:12px;background:#f0f0f0;padding:2px 6px;border-radius:3px">{{ u.loginName }}</code></td>
                <td><span class="badge" [class]="ROLE_BADGE[u.role]">{{ u.role }}</span></td>
                <td>{{ u.mobile }}</td>
                <td>{{ u.email }}</td>
                <td>
                  @if (u.isActive) { <span class="badge badge-success">Active</span> }
                  @else { <span class="badge badge-danger">Inactive</span> }
                </td>
                <td>
                  <button class="btn btn-sm btn-secondary"><i class="fa-solid fa-pencil"></i> Edit</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class Users {
  protected readonly users = signal(DEMO_USERS);
  protected readonly ROLE_BADGE = ROLE_BADGE;
}
