import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignStationComponent } from './asign-station.component';

describe('AsignStationComponent', () => {
  let component: AsignStationComponent;
  let fixture: ComponentFixture<AsignStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsignStationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
