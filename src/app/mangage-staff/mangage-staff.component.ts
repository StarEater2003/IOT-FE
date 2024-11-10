import { Component } from '@angular/core';

@Component({
  selector: 'app-mangage-staff',
  templateUrl: './mangage-staff.component.html',
  styleUrl: './mangage-staff.component.css'
})
export class MangageStaffComponent {
  page:number=1;
  staffs=[{
    name:"QA",
    position:"Admin"
  }]
}
