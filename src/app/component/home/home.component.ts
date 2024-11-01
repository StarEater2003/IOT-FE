import { Component, OnInit, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';

interface SensorData {
  temperature: number;
  humidity: number;
  fanSpeed: number;
  ledState: string;
  buzzerState: string;
  targetTemperature: number;
  targetHumidity: number;
  mediumTemperature: number;
  mediumHumidity: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private socket$: WebSocketSubject<SensorData>;
  private subscription: Subscription | undefined;

  sensorData: SensorData = {
    temperature: 100,
    humidity: 530,
    fanSpeed: 0,
    ledState: 'off',
    buzzerState: 'off',
    targetTemperature: 40,
    targetHumidity: 75,
    mediumTemperature: 35,
    mediumHumidity: 65
  };

  constructor() {
    // Khởi tạo WebSocket khi component được khởi tạo
    this.socket$ = webSocket<SensorData>('http://localhost:8080/ws'); // Địa chỉ WebSocket của backend
  }

  ngOnInit() {
    // Đăng ký để nhận dữ liệu từ WebSocket
    this.subscription = this.socket$.subscribe(
      (data: SensorData) => {
        console.log('Data received from WebSocket:', data); // Log data for debugging
        this.sensorData = data; // Cập nhật sensorData
      },
      (error) => console.error(error),
      () => console.warn('Completed!')
    );
  }

  ngOnDestroy() {
    // Hủy đăng ký khi component bị hủy
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
