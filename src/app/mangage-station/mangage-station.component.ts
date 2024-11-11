import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User, Station } from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-mangage-station',
  templateUrl: './mangage-station.component.html',
  styleUrl: './mangage-station.component.css'
})
export class MangageStationComponent {
  stationModel = {
    name: '', // Add other properties if needed
    location: '',
    uri: '',
    port: 81,
  }
  page: number = 1;
  stationsData: Station[] = []; // List of all stations
  sensorData: { [stationId: number]: any } = {}; // Store sensor data indexed by station ID
  private sockets: { [stationId: number]: WebSocketSubject<any> } = {}; // Store WebSocket connections by stationId
  private subscriptions: Subscription[] = []; // Store subscriptions
  errorMessage: string | undefined;

  showAddStationForm = false;
  constructor(
    private userService: UserService,
    private http:HttpClient
  ) { }


  ngOnInit() {
    this.getStation();
  }
  getStation(){
    this.userService.getAllStations().subscribe({
      next: (stations) => {
        this.stationsData = stations; // Store stations if needed
        this.connectToAllStations();
      },
      error: (error) => {
        console.error('Error fetching stations:', error);
        this.errorMessage = 'Could not retrieve station data.';
      }
    });
  }
  connectToAllStations() {
    this.stationsData.forEach(station => {
      // Ensure assignedStationId is a valid number before using it
      if (station.id !== null) {
        const stationId = station.id;
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

  addStation() {
    const url = 'http://localhost:8080/api/stations';
    const payload = this.stationModel;
    this.http.post(url, payload).subscribe({
        next: (response) => {
            console.log('New station added successfully', response);
            this.getStation();
          
        },
        error: (error) => {
            console.error('Error adding new station:', error);
            this.errorMessage = 'Could not add station.';
        }
    });
}

  ngOnDestroy() {
    // Unsubscribe and close all WebSocket connections when the component is destroyed
    this.subscriptions.forEach(sub => sub.unsubscribe());
    Object.values(this.sockets).forEach(socket => socket.complete());
  }

}
