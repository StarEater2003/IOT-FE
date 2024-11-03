// src/app/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap operator for side effects

// User interface to define the shape of the user object
export interface User {
    username: string;
    password: string;
    assignedStationId?: number | null; // Optional field
    role?: number; // Optional field for user role
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:8080/api/users/login'; // Replace with your actual backend URL
    private currentUser: User | null = null; // To store the currently logged-in user

    constructor(private http: HttpClient) {}

    // Method to log in a user
    login(user: User): Observable<any> {
        return this.http.post<any>(this.apiUrl, user).pipe(
            tap(response => {
                // Assuming response contains user information including assignedStationId and role
                if (response) {
                    // Store the user information in currentUser
                    this.currentUser = {
                        username: user.username,
                        password: user.password,
                        assignedStationId: response.assignedStationId,
                        role: response.role // Store the user role
                    };
                }
            })
        );
    }

    // Method to retrieve the currently logged-in user
    getCurrentUser(): User | null {
        return this.currentUser; // Return the current user or null if not logged in
    }
}
