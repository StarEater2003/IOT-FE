import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User, Station } from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import the Router
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
    private stationLogs: { [stationId: string]: any[] } = {};
    private stationLogsSubject: { [stationId: string]: BehaviorSubject<any[]> } = {}; // Observable to share logs with components
    isAddUserFormVisible = false;
    addUserData = {
        username: '',
        password: '',
        level: 1,  // Default level 1
        assignedStationId: null as string | null
    };


    // For handling the form to delete a user
    isDeleteUserFormVisible = false;
    deleteUserId: number | null = null;
    // Flags to manage sections visibility
    showUsers: boolean = true;
    showStations: boolean = false;

    // For editing station
    isEditFormVisible = false; // Flag to show or hide the form
    editFormData: any = {};
    isDeleteStationFormVisible = false;
    deleteStationId: string | null = null;
    // For displaying logs
    currentLogs: any[] = []; // Store logs of the current selected station
    currentStationId: string = ''; // Track the current selected station's ID
    maxTemperature: number = 0; // Max temperature seen
    maxHumidity: number = 0; // Max humidity seen
    isAddStationFormVisible = false;
    addStationData = {
        name: '',
        location: '',
        uri: '',
        port: 0
    };
    isUpdateUserFormVisible = false;
    updateUserData: User = {
        username: '',
        password: '',
        level: 1,
        assignedStationId: null,
        id: 0
    };
    constructor(private userService: UserService, private http: HttpClient, private router: Router) { }


    ngOnInit(): void {
        // Fetch all users and stations initially
        this.loadData();
    }

    // Fetch data and connect to stations
    loadData() {
        this.userService.getAllUsers().subscribe({
            next: (data: User[]) => {
                this.users = data.filter(user => user.level === 2); // Filter for users with level 2 (staff)
            },
            error: (error) => {
                console.error('Error fetching users:', error);
                this.errorMessage = 'Could not retrieve users data.';
            }
        });

        // Fetch all stations
        this.userService.getAllStations().subscribe({
            next: (stations) => {
                this.stations = stations;
                this.connectToAllStations();
            },
            error: (error) => {
                console.error('Error fetching stations:', error);
                this.errorMessage = 'Could not retrieve station data.';
            }
        });

    }

    // Get station logs for a specific station
    getStationLogs(stationId: string) {
        return this.stationLogsSubject[stationId]?.asObservable();
    }

    openAddStationForm() {
        this.isAddStationFormVisible = true;
        this.addStationData = {
            name: '',
            location: '',
            uri: '',
            port: 0
        };
    }

    // Close the add station form
    closeAddStationForm() {
        this.isAddStationFormVisible = false;
    }

    // Handle the submit action for adding a new station
    submitAddStationForm() {
        const url = 'http://localhost:8080/api/stations';
        const payload = {
            name: this.addStationData.name,
            location: this.addStationData.location,
            uri: this.addStationData.uri,
            port: this.addStationData.port
        };

        this.http.post(url, payload).subscribe({
            next: (response) => {
                console.log('New station added successfully', response);
                //this.loadStations();  // Refresh the station list
                this.closeAddStationForm();  // Close the form after submitting
            },
            error: (error) => {
                console.error('Error adding new station:', error);
                this.errorMessage = 'Could not add station.';
            }
        });
        this.loadDataEdit();
    }

    // Connect to all stations via WebSocket
    connectToAllStations() {
        this.sockets = {};
        this.stations.forEach(station => {
            if (station.id !== null && station.uri.length > 0 && /\d/.test(station.uri)) {
                console.log(station.id);
                const stationId = station.id;
                const stationUri = `ws://localhost:8080/ws/${stationId}`;
                const socket = webSocket(stationUri);
                this.sockets[stationId] = socket;
                console.log("stationId: " + stationUri + " uri: " + station.uri);

                if (!this.stationLogs[stationId]) {
                    this.stationLogs[stationId] = [];  // Initialize log array
                }
                if (!this.stationLogsSubject[stationId]) {
                    this.stationLogsSubject[stationId] = new BehaviorSubject<any[]>([]);
                }

                const subscription = socket.subscribe({
                    next: (data: any) => {
                        this.sensorData[stationId] = data;
                        this.stationLogs[stationId].push(data);  // Add new log data
                        this.stationLogsSubject[stationId].next(this.stationLogs[stationId]);

                        // Update max values for temperature and humidity
                        if (data.temperature > this.maxTemperature) {
                            this.maxTemperature = data.temperature;
                        }
                        if (data.humidity > this.maxHumidity) {
                            this.maxHumidity = data.humidity;
                        }
                    },
                    error: (err) => console.error(`Error from station ${stationId}:`, err),
                    complete: () => console.log(`Connection to station ${stationId} closed.`)
                });

                this.subscriptions.push(subscription); // Store subscription for cleanup
            } else {
                console.warn(`Station ${station.id} has no assigned station ID.`);
            }
        });
    }
    // Show the delete station form
    openDeleteStationForm() {
        this.isDeleteStationFormVisible = true;
        this.deleteStationId = null;  // Reset the ID input field
    }

    // Close the delete station form
    closeDeleteStationForm() {
        this.isDeleteStationFormVisible = false;
    }

    // Handle the delete station request
    submitDeleteStationForm() {
        if (this.deleteStationId != null) {
            const url = `http://localhost:8080/api/stations/${this.deleteStationId}`;
            this.http.delete(url).subscribe({
                next: (response) => {
                    console.log('Station deleted successfully', response);
                    this.loadDataEdit();  // Refresh the station list after deletion
                    this.closeDeleteStationForm();  // Close the form after deleting
                },
                error: (error) => {
                    console.error('Error deleting station:', error);
                    this.errorMessage = 'Could not delete station.';
                }
            });
        }
    }


    // Handle viewing station logs
    viewStationLogs(station: Station): void {
        this.currentStationId = station.id.toString();
        this.currentLogs = this.stationLogs[this.currentStationId]?.slice(-15) || []; // Show last 15 logs
    }

    // Open form for editing station's URI and Port
    openStationEditForm(station: Station) {
        this.editFormData = {
            stationId: station.id,
            uri: station.uri,
            port: station.port
        };
        this.isEditFormVisible = true;
    }

    // Close the edit form without saving
    closeEditForm() {
        this.isEditFormVisible = false;
    }

    // Submit the updated station data
    submitStationEditForm() {
        const url = 'http://localhost:8080/api/users/assign-sensor-station';
        const payload = {
            stationId: this.editFormData.stationId, // Keep the stationId unchanged
            uri: this.editFormData.uri,
            port: this.editFormData.port
        };
        console.log("update: " + this.editFormData.uri);
        this.http.put(url, payload).subscribe(
            (response) => {
                console.log('Station updated successfully', response);
                this.closeEditForm(); // Close the form
            },
            (error) => {
                this.errorMessage = 'An error occurred while updating the station';
                console.error('Error updating station:', error);
            }
        );
        this.loadDataEdit();  // Re-fetch data after update
    }

    // Get row style based on temperature and humidity comparison
    getRowStyle(data: any) {
        let rowStyle = {};
        const averageTemp = data.mediumTemperature;
        const averageHumidity = data.mediumHumidity;

        // Check for yellow or red color based on conditions
        if (data.temperature > averageTemp || data.humidity > averageHumidity) {
            rowStyle = { 'background-color': 'yellow' };
        }
        if (data.temperature < data.targetTemperature || data.humidity < data.targetHumidity) {
            rowStyle = { 'background-color': 'red' };
        }
        return rowStyle;
    }
    // Show the add user form
    openAddUserForm() {
        this.isAddUserFormVisible = true;
        this.addUserData = {
            username: '',
            password: '',
            level: 2,
            assignedStationId: null
        };
    }

    // Close the add user form
    closeAddUserForm() {
        this.isAddUserFormVisible = false;
    }

    // Handle the submit action for adding a new user
    submitAddUserForm() {
        const url = 'http://localhost:8080/api/users';
        const payload = {
            username: this.addUserData.username,
            password: this.addUserData.password,
            level: this.addUserData.level,
            assignedStationId: this.addUserData.assignedStationId
        };

        this.http.post(url, payload).subscribe({
            next: (response) => {
                console.log('New user added successfully', response);
                this.loadDataEdit();  // Refresh the user list
                this.closeAddUserForm();  // Close the form after submitting
            },
            error: (error) => {
                console.error('Error adding new user:', error);
                this.errorMessage = 'Could not add user.';
            }
        });
    }

    // Show the delete user form
    openDeleteUserForm() {
        this.isDeleteUserFormVisible = true;
        this.deleteUserId = null;  // Reset the ID input field
    }

    // Close the delete user form
    closeDeleteUserForm() {
        this.isDeleteUserFormVisible = false;
    }

    // Handle the delete user request
    submitDeleteUserForm() {
        if (this.deleteUserId != null) {
            const url = `http://localhost:8080/api/users/deleteUser/${this.deleteUserId}`;
            this.http.get(url).subscribe({
                next: (response) => {
                    console.log('User deleted successfully', response);
                    this.loadDataEdit();  // Refresh the user list after deletion
                    this.closeDeleteUserForm();  // Close the form after deleting
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    this.errorMessage = 'Could not delete user.';
                }
            });
        }
    }
    openUpdateUserForm(user: User) {
        this.isUpdateUserFormVisible = true;
        this.updateUserData = { ...user }; // Copy the user's data into the form
    }

    // Close the update user form
    closeUpdateUserForm() {
        this.isUpdateUserFormVisible = false;
    }

    // Handle the submit action for updating user data
    submitUpdateUserForm() {
        const url = `http://localhost:8080/api/users/update/${this.updateUserData.id}`;
        const payload = {
            username: this.updateUserData.username,
            password: this.updateUserData.password,
            level: this.updateUserData.level,
            assignedStationId: this.updateUserData.assignedStationId
        };

        this.http.post(url, payload).subscribe({
            next: (response) => {
                console.log('User updated successfully', response);
                this.loadDataEdit();  // Refresh the user list after update
                this.closeUpdateUserForm();  // Close the form after submitting
            },
            error: (error) => {
                console.error('Error updating user:', error);
                this.errorMessage = 'Could not update user.';
            }
        });
    }

    ngOnDestroy() {
        // Unsubscribe and close all WebSocket connections when the component is destroyed
        this.subscriptions.forEach(sub => sub.unsubscribe());
        Object.values(this.sockets).forEach(socket => socket.complete());
    }


    // Toggle between Users and Stations sections
    showUsersSection() {
        this.showUsers = true;
        this.showStations = false;
    }

    showStationsSection() {
        this.showUsers = false;
        this.showStations = true;
    }
    loadDataEdit() {
        this.userService.getAllUsers().subscribe({
            next: (data: User[]) => {
                this.users = data.filter(user => user.level === 2); // Filter for users with level 2 (staff)
            },
            error: (error) => {
                console.error('Error fetching users:', error);
                this.errorMessage = 'Could not retrieve users data.';
            }
        });

        // Fetch all stations
        this.userService.getAllStations().subscribe({
            next: (stations) => {
                this.stations = stations;
                this.connectToAllStations();
            },
            error: (error) => {
                console.error('Error fetching stations:', error);
                this.errorMessage = 'Could not retrieve station data.';
            }
        });
        window.location.reload();

    }
}
