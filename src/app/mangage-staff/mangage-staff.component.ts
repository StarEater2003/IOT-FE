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
  showEditUserForm= false


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
  editingUserId: number | null = null;
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
          console.log(this.staffs)
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
  onUpdateUser(staff:any) {
    this.userModel = { ...staff }; // Copy the selected user data to the form
    this.editingUserId = staff.id; // Set the ID of the user being edited
    this.showEditUserForm = true;
  }
  updateUser() {
    if (this.editingUserId !== null) {
      this.userService.updateUser(this.editingUserId, this.userModel).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.getUser(); // Refresh the user list after update
          this.showEditUserForm = false; // Hide the edit form
          this.resetUserModel(); // Reset the form
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessage = 'Could not update user.';
        },
      });
    }
  }
  submitDeleteUser(staff:any){
    if (staff.id !== null) {
      this.userService.deleteUser(staff.id).subscribe({
        next: (response) => {
          console.log('User deleted successfully', response);
          this.getUser()// Refresh the user list after deletion
          alert("Xóa user thành công!")
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'Could not delete user.';
        }
      });
    }
  }
  resetUserModel() {
    this.userModel = {
      username: '',
      password: '',
      level: 1,
      assignedStationId: null,
    };
    this.editingUserId = null;
  }

}
