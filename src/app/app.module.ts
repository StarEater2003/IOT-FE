// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AppRoutingModule } from './app-routing.module'; // Import AppRoutingModule
import { NgxPaginationModule } from 'ngx-pagination';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { StaffComponent } from './staff/staff.component';
import { MangageStationComponent } from './mangage-station/mangage-station.component';
import { MangageStaffComponent } from './mangage-staff/mangage-staff.component';


@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        AdminComponent,
        StaffComponent,
        MangageStationComponent,
        MangageStaffComponent,
    ],
    imports: [
        BrowserModule,
        NgxPaginationModule,
        FormsModule, // Add FormsModule here
        HttpClientModule, // Add HttpClientModule here
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
