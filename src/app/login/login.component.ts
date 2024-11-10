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
        // Validate username and password inputs
        if (!this.username || !this.password) {
            this.errorMessage = 'Username and password are required';
            return;
        }

        // Create a User object for login
        const user: Pick<User, 'username' | 'password'> = { username: this.username, password: this.password };

        this.userService.login(user).subscribe(
            (response: { role: number; assignedStationId: number; message: string }) => {
                // Thêm `username` từ biến `user` vì nó không có trong response từ API
                this.userService.currentUser = {
                    id: response.assignedStationId,
                    username: user.username,   // Gán thủ công username từ tham số user
                    password: user.password,
                    assignedStationId: response.assignedStationId,
                    level: response.role
                };
                
                console.log("Current User after login:", this.userService.currentUser);
        
                // Điều hướng dựa trên vai trò của người dùng
                const userRole = response.role;
                if (userRole === 1) {
                    this.router.navigate(['/admin']);
                } else if (userRole === 2) {
                    this.router.navigate(['/staff']);
                } else {
                    this.errorMessage = 'Unauthorized role';
                }
            },
            (error) => {
                this.errorMessage = 'Invalid username or password';
                console.error(error);
            }
        );
         
    }
}
