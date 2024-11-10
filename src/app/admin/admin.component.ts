import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User, Station } from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
    users: User[] = []; // List of all users
    stations: Station[] = []; // List of all stations
    sensorData: { [stationId: number]: any } = {}; // Store sensor data indexed by station ID
    private sockets: { [stationId: number]: WebSocketSubject<any> } = {}; // Store WebSocket connections by stationId
    private subscriptions: Subscription[] = []; // Store subscriptions
    errorMessage: string | undefined;

    constructor(
        private userService: UserService,
        private router:Router
    ) {}

    ngOnInit(): void {
        // Fetch all users
        this.userService.getAllUsers().subscribe({
            next: (data: User[]) => {
                this.users = data.filter(user => user.level === 2); // Filter for users with level 2 (staff)
              // Connect to all assigned stations
            },
            error: (error) => {
                console.error('Error fetching users:', error);
                this.errorMessage = 'Could not retrieve users data.';
            }
        });

        // Fetch all stations
        this.userService.getAllStations().subscribe({
            next: (stations) => {
                this.stations = stations; // Store stations if needed
                this.connectToAllStations(); 
            },
            error: (error) => {
                console.error('Error fetching stations:', error);
                this.errorMessage = 'Could not retrieve station data.';
            }
        });
    }

    // Connect to all stations based on each user's assigned station ID
    connectToAllStations() {
        this.stations.forEach(station => {
            // Ensure assignedStationId is a valid number before using it
            if (station.id !== null) {
                const stationId = station.id ; 
                const stationUri = `ws://localhost:8080/ws/${stationId}`;
                const socket = webSocket(stationUri);
                this.sockets[stationId] = socket;

                const subscription = socket.subscribe({
                    next: (data) => {
                        console.log(`Data from station ${stationId}:`, data);
                        // Store the incoming sensor data
                        this.sensorData[stationId] = data; // Now TypeScript knows stationId is a number
                    },
                    error: (err) => console.error(`Error from station ${stationId}:`, err),
                    complete: () => console.log(`Connection to station ${stationId} closed.`)
                });

                this.subscriptions.push(subscription); // Store subscription for cleanup
            } else {
                console.warn(`User ${station} has no assigned station ID.`);
            }
        });
    }

    ngOnDestroy() {
        // Unsubscribe and close all WebSocket connections when the component is destroyed
        this.subscriptions.forEach(sub => sub.unsubscribe());
        Object.values(this.sockets).forEach(socket => socket.complete());
    }
    navigateTo(path:string){
        this.router.navigate([path])
    }
}
