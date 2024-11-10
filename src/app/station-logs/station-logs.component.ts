import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import WebSocketService
import { Subscription } from 'rxjs';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-station-logs',
  templateUrl: './station-logs.component.html',
  styleUrls: ['./station-logs.component.css']
})
export class StationLogsComponent implements OnInit, OnDestroy {
  stationId: string | null = null;
  stationLogs: any[] = [];
  private logSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private adminComponent: AdminComponent // Inject WebSocketService
  ) {}

  ngOnInit(): void {
    // Get stationId from route parameters
    console.log("log");
    this.route.paramMap.subscribe(params => {
      this.stationId = params.get('stationId')!;
      this.fetchStationLogs();
    });
  }

  fetchStationLogs() {
    if (this.stationId !== null) {
      // Subscribe to logs from WebSocketService
      this.logSubscription = this.adminComponent.getStationLogs(this.stationId).subscribe(logs => {
        this.stationLogs = logs;
      });
    }
  }

  ngOnDestroy() {
    if (this.logSubscription) {
      this.logSubscription.unsubscribe();
    }
  }
}
