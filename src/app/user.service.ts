import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
    username: string;
    password: string;
    level: number;
    assignedStationId: number | null; // Optional, can be null for some users
}

export interface Station {
    id: number;
    name: string; // Add other properties if needed
    localtion: string;
    uri: string;
    port: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:8080/api/users'; // API base URL
    private apiUrlLogin = 'http://localhost:8080/api/users/login'; // Login API URL
    private apiUrlStations = 'http://localhost:8080/api/stations'; // Stations API URL

    currentUser: User | null = null; // To store the currently logged-in user

    constructor(private http: HttpClient) {}

    // Method to log in a user
    login(user: Partial<Pick<User, 'username' | 'password'>>): Observable<any> {
        // Đảm bảo dữ liệu gửi lên BE có định dạng như yêu cầu
        const loginPayload = {
            username: user.username || '',
            password: user.password || ''
        };
        console.log(loginPayload.username+" "+loginPayload.password);
    
        return this.http.post<any>(this.apiUrlLogin, loginPayload).pipe(
            tap(response => {
                // Giả sử response chứa thông tin người dùng bao gồm id, assignedStationId, và role (level)
                if (response) {
                    console.log(response.role);
                    // Lưu thông tin người dùng vào currentUser sau khi đăng nhập thành công
                    this.currentUser = {
                        username: loginPayload.username, // Username từ loginPayload
                        password: loginPayload.password, // Password từ loginPayload
                        assignedStationId: response.assignedStationId, // Lấy assignedStationId từ response
                        level: response.role // Lấy level từ response
                    };
                }
            })
        );
    }
    

    // Method to get the current user
    getCurrentUser(): User | null {
        return this.currentUser; // Return the stored current user
    }

    // Method to fetch all users
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}`);
    }

    // Method to fetch all stations
    getAllStations(): Observable<Station[]> {
        return this.http.get<Station[]>(`${this.apiUrlStations}`);
    }
}
