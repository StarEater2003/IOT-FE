import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService,User,Station} from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mangage-staff',
  templateUrl: './mangage-staff.component.html',
  styleUrl: './mangage-staff.component.css'
})
export class MangageStaffComponent {
  users: User[] = []; // List of all users
  errorMessage: string | undefined;
  page:number=1;
  staffs:User[]=[];
    
  constructor(
    private userService: UserService,
    private router:Router
) {}
  ngOnInit(){
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
          this.users = data.filter(user => user.level === 2); // Filter for users with level 2 (staff)
          this.staffs=this.users
          console.log(this.users)
        // Connect to all assigned stations
      },
      error: (error) => {
          console.error('Error fetching users:', error);
          this.errorMessage = 'Could not retrieve users data.';
      }
  });

  }
}
