import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../user.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MangageStationComponent } from '../mangage-station/mangage-station.component';
import { ActivatedRoute } from '@angular/router';

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
  @ViewChild('targetTempInput') targetTempInput: ElementRef | undefined;
  @ViewChild('targetHumidityInput') targetHumidityInput: ElementRef | undefined;
  @ViewChild('mediumTempInput') mediumTempInput: ElementRef | undefined;
  @ViewChild('mediumHumiInput') mediumHumiInput: ElementRef | undefined;
  @ViewChild('fanSpeedInput') fanSpeedInput: ElementRef | undefined;
  // New properties for input fields
  targetTemperature: number | undefined;
  targetHumidity: number | undefined;
  mediumTemperature: number | undefined;
  mediumHumidity: number | undefined;
  lastLedStatus: string | undefined ;
  lastBuzzerStatus: string | undefined;
  selectedLEDState: string | null = null;  // 'on', 'off', hoặc null (mặc định)
  selectedBuzzerState: string | null = null; 
  constructor(private userService: UserService, private http: HttpClient,private route: ActivatedRoute) { }

  ngOnInit() {
    // Lấy stationId từ queryParams nếu có
    this.route.queryParams.subscribe(params => {
      const stationIdFromRoute = params['stationId'];
      console.log(stationIdFromRoute);
      if (stationIdFromRoute) {
        this.assignedStationId = +stationIdFromRoute; // Chuyển chuỗi thành số
      } else {
        const currentUser = this.userService.getCurrentUser();
        if (currentUser) {
          this.assignedStationId = currentUser.assignedStationId || null;
        }
      }

      if (this.assignedStationId) {
        this.uri = `ws://localhost:8080/ws/${this.assignedStationId}`;
        this.connectWebSocket();
      } else {
        this.errorMessage = 'Bạn chưa có quyền truy cập vào trạm.';
      }
    });
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
        console.log(this.sensorData.targetHumidity + " " + this.targetHumidity);

        this.targetTemperature = this.sensorData.targetTemperature;

        this.targetHumidity = this.sensorData.targetHumidity;

        this.mediumTemperature = this.sensorData.mediumTemperature;

        this.mediumHumidity = this.sensorData.mediumHumidity;
        this.lastBuzzerStatus = this.sensorData.buzzerState;
        this.lastLedStatus = this.sensorData.ledState;
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
  toggleLED(state: string) {
    if (this.sensorData) {
      this.selectedLEDState = state;
      this.sensorData.ledState = this.selectedLEDState;
      if(this.lastBuzzerStatus) this.sensorData.buzzerState = this.lastBuzzerStatus;
      this.updateSensorData(); // Send updated data to server
    }
  }

  toggleBuzzer(state: string) {
    if (this.sensorData) {
      this.selectedBuzzerState = state;
      this.sensorData.buzzerState = this.selectedBuzzerState;
      if(this.lastLedStatus){ this.sensorData.ledState = this.lastLedStatus;
        console.log(this.lastLedStatus);
      }
      this.updateSensorData(); // Send updated data to server
    }
  }
  setDefault() {
    if (this.sensorData) {
      this.selectedLEDState = null; // Xóa lựa chọn LED để giữ nguyên trạng thái mặc định
      this.selectedBuzzerState = null;
      this.sensorData.ledState = "default";  // Để trống, sử dụng giá trị mặc định từ sensorData
      this.sensorData.buzzerState = "default";
      console.log("default");
      this.updateSensorData();
    }
  }
  btnUpdateSensorData(){
    if(this.sensorData){
      this.sensorData.ledState = "default";  // Để trống, sử dụng giá trị mặc định từ sensorData
      this.sensorData.buzzerState = "default";
      this.updateSensorData();
    }
  }


  updateSensorData() {
    if (this.assignedStationId) {
      const targetTemperatureUpdate = this.targetTempInput?.nativeElement.value;
      const targetHumidityUpdate = this.targetHumidityInput?.nativeElement.value;
      const mediumTemperatureUpdate = this.mediumTempInput?.nativeElement.value;
      const mediumHumidityUpdate = this.mediumHumiInput?.nativeElement.value;
      const fanSpeedUpdate = this.fanSpeedInput?.nativeElement.value;
      console.log(targetHumidityUpdate + " " + targetTemperatureUpdate);
      console.log(this.sensorData?.ledState +" "+this.sensorData?.buzzerState);

      // Create a SensorData object with current values
      const updatedData: SensorData = {
        temperature: this.sensorData?.temperature || 0,
        humidity: this.sensorData?.humidity || 0,
        ledState: this.sensorData?.ledState || '',
        fanSpeed: fanSpeedUpdate || this.sensorData?.fanSpeed,
        buzzerState: this.sensorData?.buzzerState || '',
        targetTemperature: targetTemperatureUpdate !== undefined ? targetTemperatureUpdate : this.sensorData?.targetTemperature,
        targetHumidity: targetHumidityUpdate !== undefined ? targetHumidityUpdate : this.sensorData?.targetHumidity,
        mediumTemperature: mediumTemperatureUpdate !== undefined ? mediumTemperatureUpdate : this.sensorData?.mediumTemperature,
        mediumHumidity: mediumHumidityUpdate !== undefined ? mediumHumidityUpdate : this.sensorData?.mediumHumidity,
      };
      console.log(updatedData);
      // Send PUT request to update sensor dataS
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
