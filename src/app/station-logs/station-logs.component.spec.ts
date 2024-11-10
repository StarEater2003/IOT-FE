import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationLogsComponent } from './station-logs.component';

describe('StationLogsComponent', () => {
  let component: StationLogsComponent;
  let fixture: ComponentFixture<StationLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StationLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
