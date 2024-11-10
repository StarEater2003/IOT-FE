// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username: string = '';
    password: string = '';
    errorMessage: string = '';

    constructor(private userService: UserService, private router: Router) {}

    login() {
      if (!this.username || !this.password) {
          this.errorMessage = 'Username and password are required';
          return;
      }
      const user: User = { username: this.username, password: this.password };
      this.userService.login(user).subscribe(
          response => {
            console.log(response)
              // Assuming the backend returns an object containing the role
              const userRole = response.role;
              if (userRole === 1) {
                  this.router.navigate(['/admin']);
              } else if (userRole === 2) {
                  this.router.navigate(['/staff']);
              } else {
                  this.errorMessage = 'Unauthorized role';
              }
          },
          error => {
              this.errorMessage = 'Invalid username or password'; // Handle error appropriately
              console.error(error); // Log the error for debugging
          }
      );
  }
  
}
