// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { StaffComponent } from './staff/staff.component';

const routes: Routes = [
    { path: '', component: LoginComponent },  // Default route
   
    { path: 'admin', component: AdminComponent },
    { path: 'staff', component: StaffComponent },
    { path: '**', redirectTo: '' }  // Redirect unknown routes to login
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
