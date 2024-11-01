import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  sensorData=
  {
    "temperature": 30,
    "humidity": 53,
    "fanSpeed": 0,
    "ledState": "off",
    "buzzerState": "off",
    "targetTemperature": 40,
    "targetHumidity": 75,
    "mediumTemperature": 35,
    "mediumHumidity": 65
  }
}
