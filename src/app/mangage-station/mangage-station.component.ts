import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-mangage-station',
  templateUrl: './mangage-station.component.html',
  styleUrl: './mangage-station.component.css'
})
export class MangageStationComponent {
  page:number=1;
  stationData=[
    {
      id:"1",
      name:"HN",
      location:"VN",
      uri:""
    }
  ]
}
