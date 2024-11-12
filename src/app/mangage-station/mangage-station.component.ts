import { NgxPaginationModule } from 'ngx-pagination';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User, Station } from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-mangage-station',
  templateUrl: './mangage-station.component.html',
  styleUrl: './mangage-station.component.css'
})
export class MangageStationComponent {
  stationModel = {
    id: '',
    name: '',
    location:'',
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
  showEditStationForm = false;

  private stationLogs: { [stationId: string]: any[] } = {};
  private stationLogsSubject: { [stationId: string]: BehaviorSubject<any[]> } = {};
  currentLogs: any[] = []; // Store logs of the current selected station
  currentStationId: string = ''; // Track the current selected station's ID
  maxTemperature: number = 0; // Max temperature seen
  maxHumidity: number = 0;
  constructor(
    private userService: UserService,
    private http: HttpClient,
    private router: Router
  ) { }


  ngOnInit() {
    this.getStation();
  }
  //lấy danh sách các trạm
  getStation() {
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
  //lấy data từ trạm
  connectToAllStations() {
    this.stationsData.forEach(station => {
      // Ensure assignedStationId is a valid number before using it
      if (station.id !== null && station.uri && /\d/.test(station.uri) && station.uri.length > 6
      ) {
        const stationId = station.id;
        const stationUri = `ws://localhost:8080/ws/${stationId}`;
        const socket = webSocket(stationUri);
        this.sockets[stationId] = socket;
        if (!this.stationLogs[stationId]) {
          this.stationLogs[stationId] = [];  // Initialize log array if it doesn't exist
        }
        if (!this.stationLogsSubject[stationId]) {
          this.stationLogsSubject[stationId] = new BehaviorSubject<any[]>([]);  // Initialize BehaviorSubject if it doesn't exist
        }
        const subscription = socket.subscribe({
          next: (data) => {
            console.log(`Data from station ${stationId}:`, data);
            // Store the incoming sensor data
            this.sensorData[stationId] = data;
            if (this.stationLogs[stationId].length === 0 || this.stationLogs[stationId][this.stationLogs[stationId].length - 1] !== data) {
              this.stationLogs[stationId].push(data);
            }

            // Update the BehaviorSubject with the latest log data
            this.stationLogsSubject[stationId].next(this.stationLogs[stationId]);
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
  //thêm trạm
  addStation() {
    const url = 'http://localhost:8080/api/stations';
    const payload = this.stationModel;
    this.http.post(url, payload).subscribe({
      next: (response) => {
        console.log('New station added successfully', response);
        this.getStationEdit();

      },
      error: (error) => {
        console.error('Error adding new station:', error);
        this.errorMessage = 'Could not add station.';
      }
    });
  }
  //mở form update Station
  onUpdateStation(station: any) {
    this.stationModel = { ...station }; // Copy the selected station data to stationModel
    this.showEditStationForm = true; // Show the update form
  }
  //cập nhật thông tin trạm

  updateStation() {
    console.log(this.stationModel.id);
    const url = `http://localhost:8080/api/users/assign-sensor-station`;
    const payload = {
      stationId: this.stationModel.id,

      uri: this.stationModel.uri,
      port: this.stationModel.port
    };
    this.http.put(url, payload).subscribe({
      next: (response) => {
        alert("Cập nhật trạm thành công");
        this.getStationEdit(); // Refresh the station list
        // Close the form after updating
      },
      error: (error) => {
        console.error('Error updating station:', error);
        this.errorMessage = 'Could not update station.';
      }
    });
    this.showEditStationForm = false;
    window.location.reload();
  }

  submitDeleteStationForm(station: any) {
    if (station.id != null) {
      const url = `http://localhost:8080/api/stations/${station.id}`;
      this.http.delete(url).subscribe({
        next: (response) => {
          alert('Xóa trạm thành công');
          this.getStationEdit();
        },
        error: (error) => {
          console.error('Error deleting station:', error);
          this.errorMessage = 'Could not delete station.';
        }
      });
    }
  }
  viewStationLogs(station: any): void {
    // Lấy logs của station từ stationLogs và hiển thị trong currentLogs
    this.currentStationId = station.id.toString();
    this.currentLogs = this.stationLogs[this.currentStationId]?.slice(-15) || []; // Hiển thị 15 log gần nhất
  }
  ngOnDestroy() {
    // Unsubscribe and close all WebSocket connections when the component is destroyed
    this.subscriptions.forEach(sub => sub.unsubscribe());
    Object.values(this.sockets).forEach(socket => socket.complete());
  }
  manageStation(station: any) {
    const stationId = station.id;
    console.log(stationId);
    this.router.navigate(['/staff'], { queryParams:  {stationId}});
  }
  getStationEdit() {
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
    window.location.reload();
  }

}
