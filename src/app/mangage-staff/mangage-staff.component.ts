import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService,User,Station} from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mangage-staff',
  templateUrl: './mangage-staff.component.html',
  styleUrl: './mangage-staff.component.css',
})
export class MangageStaffComponent {
  showAddUserForm = false;
  userModel:User = {
    username: '',
    password: '',
    level: 1,
    assignedStationId: null
  };
  users: User[] = []; // List of all users
  errorMessage: string | undefined;
  page:number=1;
  staffs:User[]=[];
    
  constructor(
    private userService: UserService,
    private router:Router,
  ) {}
  ngOnInit(){
   this.getUser();
  }
  getUser(){
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

  addUser(){
    this.showAddUserForm = false;
    this.userService.createUser(this.userModel).subscribe(
      response => {
        console.log('Người dùng đã được tạo:', response);
          this.getUser();
        // Xử lý khi người dùng được tạo thành công
      },
      error => {
        console.error('Có lỗi xảy ra:', error);
        // Xử lý lỗi khi gửi yêu cầu
      }
    );
    this.userModel = {
      username: '',
      password: '',
      level: 1,
      assignedStationId: null
    };
    console.log(this.userModel)
  
  }
  assignStation(staff:any) {
    // const modalRef = this.modalService.open(AsignStationComponent);
    // modalRef.componentInstance.user = staff;
    // modalRef.result.then(result => {
    //   if (result) {
    //     this.getUser();
    //   }
    // });
  }
}
