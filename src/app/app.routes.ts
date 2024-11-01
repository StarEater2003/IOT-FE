import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { StationComponent } from './station/station.component';

export const routes: Routes = [
    {path:"station",component:HomeComponent},
    {path:"home",component:StationComponent},
    {path:"",component:HomeComponent}
];
