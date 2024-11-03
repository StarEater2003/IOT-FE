import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface SensorData {
  temperature: number;
  humidity: number;
  fanSpeed: number;
  ledState: string;
  buzzerState: string;
  targetTemperature?: number;
  targetHumidity?: number;
  mediumTemperature?: number;
  mediumHumidity?: number;
}

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit, OnDestroy {
  assignedStationId: number | null = null; // ID của trạm được gán
  uri: string = ''; // Địa chỉ URI mà bạn sẽ sử dụng để kết nối WebSocket
  private socket$: WebSocketSubject<SensorData> | undefined;
  private subscription: Subscription | undefined;
  private timeoutId: any; // ID của timeout
  sensorData: SensorData | undefined; // Dữ liệu cảm biến
  errorMessage: string | null = null; // Thông báo lỗi

  // New properties for input fields
  targetTemperature: number | undefined; 
  targetHumidity: number | undefined; 
  mediumTemperature: number | undefined; 
  mediumHumidity: number | undefined; 

  constructor(private userService: UserService, private http: HttpClient) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser(); // Lấy thông tin người dùng hiện tại
    if (currentUser) {
      this.assignedStationId = currentUser.assignedStationId || null; // Gán ID trạm cho người dùng
      if (this.assignedStationId) {
        this.uri = `ws://localhost:8080/ws/${this.assignedStationId}`; // Cập nhật URI cho WebSocket
        this.connectWebSocket();
      } else {
        this.errorMessage = 'Bạn chưa có quyền truy cập vào trạm.';
      }
    }
  }

  connectWebSocket() {
    this.socket$ = webSocket<SensorData>(this.uri);
    
    this.timeoutId = setTimeout(() => {
      this.errorMessage = 'Không nhận được dữ liệu từ trạm trong 5 giây.';
      this.socket$?.complete(); // Đóng WebSocket
    }, 5000);

    this.subscription = this.socket$.subscribe(
      (data: SensorData) => {
        this.sensorData = data; // Cập nhật sensorData
        this.errorMessage = null; // Xóa thông báo lỗi khi nhận dữ liệu
        clearTimeout(this.timeoutId); // Xóa timeout khi nhận dữ liệu

        // Populate the input fields with current sensor data
        this.targetTemperature = this.sensorData.targetTemperature;
        this.targetHumidity = this.sensorData.targetHumidity;
        this.mediumTemperature = this.sensorData.mediumTemperature;
        this.mediumHumidity = this.sensorData.mediumHumidity;
      },
      (error) => {
        console.error('Lỗi kết nối WebSocket:', error);
        this.errorMessage = 'Lỗi kết nối với WebSocket.';
      },
      () => {
        console.warn('Đã hoàn thành!');
      }
    );
  }

  updateSensorData() {
    if (this.assignedStationId) {
      // Create a SensorData object with current values
      const updatedData: SensorData = {
        temperature: this.sensorData?.temperature || 0,
        humidity: this.sensorData?.humidity || 0,
        fanSpeed: this.sensorData?.fanSpeed || 0,
        ledState: this.sensorData?.ledState || '',
        buzzerState: this.sensorData?.buzzerState || '',
        targetTemperature: this.targetTemperature !== undefined ? this.targetTemperature : this.sensorData?.targetTemperature,
        targetHumidity: this.targetHumidity !== undefined ? this.targetHumidity : this.sensorData?.targetHumidity,
        mediumTemperature: this.mediumTemperature !== undefined ? this.mediumTemperature : this.sensorData?.mediumTemperature,
        mediumHumidity: this.mediumHumidity !== undefined ? this.mediumHumidity : this.sensorData?.mediumHumidity,
      };

      // Send PUT request to update sensor data
      this.http.put(`http://localhost:8080/api/sensors/update/${this.assignedStationId}`, updatedData)
        .subscribe({
          next: (response) => {
            console.log('Dữ liệu đã được cập nhật thành công:', response);
            this.errorMessage = null; // Clear error message if successful
          },
          error: (err) => {
            console.error('Lỗi khi cập nhật dữ liệu:', err);
            this.errorMessage = 'Lỗi khi cập nhật dữ liệu.';
          }
        });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
