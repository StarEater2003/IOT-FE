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
    private apiUrlAddUser = ''

    currentUser: User | null = null; // To store the currently logged-in user

    constructor(private http: HttpClient) { }

    // Method to log in a user
    login(user: Partial<Pick<User, 'username' | 'password'>>): Observable<any> {
        // Đảm bảo dữ liệu gửi lên BE có định dạng như yêu cầu
        const loginPayload = {
            username: user.username || '',
            password: user.password || ''
        };
        console.log(loginPayload.username + " " + loginPayload.password);

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
    createUser(user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    updateUser(id: number, data: any): Observable<any> {
        const url = `${this.apiUrl}/update/${id}`;
        return this.http.post(url, data);
    }

    deleteUser(id: number): Observable<any> {
        const url = `${this.apiUrl}/deleteUser/${id}`;
        return this.http.get(url); // Assuming the API endpoint uses GET for deletion
    }


    assignStationToUser(userId: number, stationId: number): Observable<void> {
        // Tạo URL cho endpoint PUT
        const url = `${this.apiUrl}/${userId}/assign-user-station`;
        return this.http.put<void>(url, stationId).pipe(
            tap(() => {
                // Xử lý sau khi gán station cho user nếu cần
                console.log(`Assigned station ${stationId} to user with id ${userId}`);
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
